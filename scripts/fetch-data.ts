/**
 * Producer of src/data/snapshot.json (see src/data/schema.ts for the
 * contract). Pulls live numbers from GitHub, npm and crates.io so the site
 * and the profile README never show a hardcoded placeholder.
 *
 * Resilience: github/npm/crates are each fetched inside their own
 * try/catch. On failure, the previous snapshot's data for that source is
 * kept, `ok` is set to false and `lastSuccessAt` carries forward from the
 * previous run (see resolveSource in scripts/lib/fetch-helpers.ts).
 *
 * Run with `node scripts/fetch-data.ts`. Auth: GITHUB_TOKEN env var, else
 * `gh auth token`, else unauthenticated (low rate limits).
 */

import { execSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { PackageStat, RepoStat, Snapshot, Totals, UpstreamStat, UserStat } from '../src/data/schema.ts';
import {
  CRATES,
  UPSTREAM_IGNORE,
  UPSTREAM_MIN_STARS,
  UPSTREAM_SEED,
  chunkPackageNamesForDownloadsApi,
  deriveCrateDownloads,
  frameworksFromCargoToml,
  frameworksFromPackageJson,
  frameworksFromPyprojectToml,
  isExcludedPackage,
  isPublicRepo,
  pickLatestRelease,
  repoNameFromRepositoryField,
  resolveSimpleWorkspaceDir,
  resolveSource,
  shouldIncludeRepo,
  sortByDownloadsThenName,
  sortByStarsDesc,
  sortByStarsThenName,
  sumReleaseDownloads,
  upstreamProofUrl,
  workspaceGlobs,
  type PackageJsonManifest,
  type RawRelease,
  type SourceAttempt,
} from './lib/fetch-helpers.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SNAPSHOT_PATH = path.join(__dirname, '..', 'src', 'data', 'snapshot.json');

const GITHUB_API = 'https://api.github.com';
const GITHUB_LOGIN = 'rodrigogs';
const CRATES_USER_AGENT = 'rodrigogs.github.io site build (contact: rodrigo.smscom@gmail.com)';

// ---------------------------------------------------------------------------
// Small utils
// ---------------------------------------------------------------------------

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Runs `fn` over `items` with at most `limit` in flight at once. */
async function mapWithConcurrency<T, R>(items: T[], limit: number, fn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker(): Promise<void> {
    for (;;) {
      const i = next++;
      if (i >= items.length) return;
      results[i] = await fn(items[i] as T, i);
    }
  }
  const workerCount = Math.max(1, Math.min(limit, items.length));
  await Promise.all(Array.from({ length: workerCount }, () => worker()));
  return results;
}

async function resolveToken(): Promise<string | null> {
  if (process.env.GITHUB_TOKEN) return process.env.GITHUB_TOKEN;
  try {
    const token = execSync('gh auth token', { encoding: 'utf8' }).trim();
    return token || null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------------------
// GitHub HTTP layer (core API + search API with its own throttle/backoff)
// ---------------------------------------------------------------------------

function githubHeaders(token: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    accept: 'application/vnd.github+json',
    'x-github-api-version': '2022-11-28',
    'user-agent': 'rodrigogs.github.io-site-build',
  };
  if (token) headers.authorization = `Bearer ${token}`;
  return headers;
}

/** GitHub core REST API is 5000 req/hr authenticated; still backs off on 403/429/5xx. */
async function githubJson(url: string, token: string | null, attempt = 0): Promise<any> {
  const res = await fetch(url, { headers: githubHeaders(token) });
  if ((res.status === 403 || res.status === 429 || res.status >= 500) && attempt < 3) {
    const waitMs = backoffMs(res, attempt);
    console.error(`[github] ${res.status} on ${url}, retrying in ${Math.round(waitMs / 1000)}s`);
    await sleep(waitMs);
    return githubJson(url, token, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub ${res.status} ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

function backoffMs(res: Response, attempt: number): number {
  const retryAfter = res.headers.get('retry-after');
  if (retryAfter) return Number(retryAfter) * 1000;
  const reset = res.headers.get('x-ratelimit-reset');
  if (reset) {
    const resetAt = Number(reset) * 1000;
    const wait = resetAt - Date.now() + 1000;
    if (wait > 0) return wait;
  }
  return 3000 * (attempt + 1);
}

async function githubJsonPaginated(urlBase: string, token: string | null, perPage = 100): Promise<any[]> {
  const results: any[] = [];
  let pageNum = 1;
  for (;;) {
    const sep = urlBase.includes('?') ? '&' : '?';
    const url = `${urlBase}${sep}per_page=${perPage}&page=${pageNum}`;
    const batch = await githubJson(url, token);
    if (!Array.isArray(batch) || batch.length === 0) break;
    results.push(...batch);
    if (batch.length < perPage) break;
    pageNum++;
  }
  return results;
}

// GitHub Search API is limited to 30 req/min: throttle every call >= 2.2s apart.
const SEARCH_MIN_INTERVAL_MS = 2200;
let lastSearchCallAt = 0;

async function githubSearchJson(url: string, token: string | null, attempt = 0): Promise<any> {
  const wait = lastSearchCallAt + SEARCH_MIN_INTERVAL_MS - Date.now();
  if (wait > 0) await sleep(wait);
  lastSearchCallAt = Date.now();

  const res = await fetch(url, { headers: githubHeaders(token) });
  if ((res.status === 403 || res.status === 429) && attempt < 5) {
    const waitMs = backoffMs(res, attempt);
    console.error(`[github:search] rate limited, retrying in ${Math.round(waitMs / 1000)}s: ${url}`);
    await sleep(waitMs);
    return githubSearchJson(url, token, attempt + 1);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new Error(`GitHub search ${res.status} ${url}: ${body.slice(0, 200)}`);
  }
  return res.json();
}

async function searchIssuesJson(
  query: string,
  token: string | null,
  opts: { sort?: string; order?: 'asc' | 'desc'; perPage?: number } = {},
): Promise<{ total_count: number; items: any[] }> {
  const params = new URLSearchParams({ q: query, per_page: String(opts.perPage ?? 1) });
  if (opts.sort) params.set('sort', opts.sort);
  if (opts.order) params.set('order', opts.order);
  return githubSearchJson(`${GITHUB_API}/search/issues?${params.toString()}`, token);
}

async function searchCommitsJson(
  query: string,
  token: string | null,
  opts: { sort?: string; order?: 'asc' | 'desc'; perPage?: number } = {},
): Promise<{ total_count: number; items: any[] }> {
  const params = new URLSearchParams({ q: query, per_page: String(opts.perPage ?? 1) });
  if (opts.sort) params.set('sort', opts.sort);
  if (opts.order) params.set('order', opts.order);
  return githubSearchJson(`${GITHUB_API}/search/commits?${params.toString()}`, token);
}

async function fetchContentsFile(fullName: string, filePath: string, token: string | null): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${fullName}/contents/${filePath}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  if (!res.ok) return null;
  const json: any = await res.json();
  if (!json || json.type !== 'file' || typeof json.content !== 'string') return null;
  const encoding = json.encoding === 'base64' ? 'base64' : 'utf8';
  return Buffer.from(json.content, encoding).toString('utf8');
}

async function fetchJsonManifest(fullName: string, filePath: string, token: string | null): Promise<any | null> {
  const text = await fetchContentsFile(fullName, filePath, token);
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function fetchContentsDir(fullName: string, dir: string, token: string | null): Promise<any[] | null> {
  const url = `${GITHUB_API}/repos/${fullName}/contents/${dir}`;
  const res = await fetch(url, { headers: githubHeaders(token) });
  if (!res.ok) return null;
  const json = await res.json();
  return Array.isArray(json) ? json : null;
}

// ---------------------------------------------------------------------------
// Frameworks (manifest -> display names)
// ---------------------------------------------------------------------------

async function fetchWorkspaceFrameworks(fullName: string, pkgJson: PackageJsonManifest, token: string | null): Promise<Set<string>> {
  const frameworks = new Set<string>();
  const dirs = workspaceGlobs(pkgJson)
    .map(resolveSimpleWorkspaceDir)
    .filter((d): d is string => d !== null);

  let fetched = 0;
  const WORKSPACE_MANIFEST_LIMIT = 6;
  for (const dir of dirs) {
    if (fetched >= WORKSPACE_MANIFEST_LIMIT) break;
    const entries = await fetchContentsDir(fullName, dir, token);
    if (!entries) continue;
    for (const entry of entries) {
      if (fetched >= WORKSPACE_MANIFEST_LIMIT) break;
      if (entry.type !== 'dir') continue;
      const subPkg = await fetchJsonManifest(fullName, `${entry.path}/package.json`, token);
      fetched++;
      if (subPkg) for (const f of frameworksFromPackageJson(subPkg)) frameworks.add(f);
    }
  }
  return frameworks;
}

async function fetchRepoFrameworks(fullName: string, token: string | null): Promise<string[]> {
  const frameworks = new Set<string>();

  const pkgJson = await fetchJsonManifest(fullName, 'package.json', token);
  if (pkgJson) {
    for (const f of frameworksFromPackageJson(pkgJson)) frameworks.add(f);
    for (const f of await fetchWorkspaceFrameworks(fullName, pkgJson, token)) frameworks.add(f);
  }

  const cargoToml = await fetchContentsFile(fullName, 'Cargo.toml', token);
  if (cargoToml) for (const f of frameworksFromCargoToml(cargoToml)) frameworks.add(f);

  const pyproject = await fetchContentsFile(fullName, 'pyproject.toml', token);
  if (pyproject) for (const f of frameworksFromPyprojectToml(pyproject)) frameworks.add(f);

  return [...frameworks].sort();
}

// ---------------------------------------------------------------------------
// Repos
// ---------------------------------------------------------------------------

async function buildRepoStat(raw: any, token: string | null): Promise<RepoStat> {
  const fullName: string = raw.full_name;

  let languages: Record<string, number> = {};
  try {
    languages = await githubJson(`${GITHUB_API}/repos/${fullName}/languages`, token);
  } catch (err) {
    console.error(`[github] languages failed for ${fullName}: ${(err as Error).message}`);
  }

  let releases: RawRelease[] = [];
  try {
    releases = await githubJsonPaginated(`${GITHUB_API}/repos/${fullName}/releases`, token);
  } catch (err) {
    console.error(`[github] releases failed for ${fullName}: ${(err as Error).message}`);
  }

  let frameworks: string[] = [];
  try {
    frameworks = await fetchRepoFrameworks(fullName, token);
  } catch (err) {
    console.error(`[github] frameworks failed for ${fullName}: ${(err as Error).message}`);
  }

  const spdxId = raw.license?.spdx_id;
  const license = spdxId && spdxId !== 'NOASSERTION' ? spdxId : null;

  return {
    name: raw.name,
    fullName,
    url: raw.html_url,
    description: raw.description ?? null,
    homepage: raw.homepage || null,
    stars: raw.stargazers_count ?? 0,
    forks: raw.forks_count ?? 0,
    language: raw.language ?? null,
    languages,
    topics: raw.topics ?? [],
    frameworks,
    createdAt: raw.created_at,
    pushedAt: raw.pushed_at,
    archived: Boolean(raw.archived),
    fork: Boolean(raw.fork),
    license,
    latestRelease: pickLatestRelease(releases),
    releaseCount: releases.length,
    releaseDownloads: sumReleaseDownloads(releases),
  };
}

// ---------------------------------------------------------------------------
// User + contributions
// ---------------------------------------------------------------------------

async function fetchContributionsLastYear(token: string | null): Promise<number | null> {
  if (!token) return null;
  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: 'POST',
    headers: { ...githubHeaders(token), 'content-type': 'application/json' },
    body: JSON.stringify({
      query: `query { user(login: "${GITHUB_LOGIN}") { contributionsCollection { contributionCalendar { totalContributions } } } }`,
    }),
  });
  if (!res.ok) throw new Error(`GraphQL ${res.status}`);
  const json: any = await res.json();
  if (json.errors) throw new Error(`GraphQL errors: ${JSON.stringify(json.errors)}`);
  const total = json?.data?.user?.contributionsCollection?.contributionCalendar?.totalContributions;
  return typeof total === 'number' ? total : null;
}

async function fetchUserStat(token: string | null): Promise<UserStat> {
  const raw = await githubJson(`${GITHUB_API}/users/${GITHUB_LOGIN}`, token);

  let contributionsLastYear: number | null = null;
  try {
    contributionsLastYear = await fetchContributionsLastYear(token);
  } catch (err) {
    console.error(`[github] contributions graphql failed: ${(err as Error).message}`);
  }

  return {
    login: raw.login,
    name: raw.name ?? raw.login,
    followers: raw.followers ?? 0,
    publicRepos: raw.public_repos ?? 0,
    createdAt: raw.created_at,
    contributionsLastYear,
  };
}

// ---------------------------------------------------------------------------
// Upstream
// ---------------------------------------------------------------------------

async function buildUpstreamRow(repo: string, stars: number, token: string | null): Promise<UpstreamStat> {
  const prsAsc = await searchIssuesJson(`repo:${repo} is:pr author:rodrigogs`, token, { sort: 'created', order: 'asc', perPage: 1 });
  const prsDesc = await searchIssuesJson(`repo:${repo} is:pr author:rodrigogs`, token, { sort: 'created', order: 'desc', perPage: 1 });
  const prsOpened = prsAsc.total_count;
  const firstPrAt: string | null = prsAsc.items[0]?.created_at ?? null;
  const lastPrAt: string | null = prsDesc.items[0]?.created_at ?? null;

  const merged = await searchIssuesJson(`repo:${repo} is:pr author:rodrigogs is:merged`, token, {
    sort: 'created',
    order: 'desc',
    perPage: 8,
  });
  const mergedPrs = merged.total_count;
  const highlights = merged.items.slice(0, 8).map((item: any) => ({
    title: item.title as string,
    url: item.html_url as string,
    mergedAt: (item.pull_request?.merged_at ?? item.closed_at) as string,
  }));

  const commitsAsc = await searchCommitsJson(`repo:${repo} author:rodrigogs`, token, { sort: 'author-date', order: 'asc', perPage: 1 });
  const commitsDesc = await searchCommitsJson(`repo:${repo} author:rodrigogs`, token, { sort: 'author-date', order: 'desc', perPage: 1 });
  const commits = commitsAsc.total_count;
  const firstCommitAt: string | null = commitsAsc.items[0]?.commit?.author?.date ?? null;
  const lastCommitAt: string | null = commitsDesc.items[0]?.commit?.author?.date ?? null;

  const dates = [firstPrAt, lastPrAt, firstCommitAt, lastCommitAt].filter((d): d is string => Boolean(d));
  const firstAt = dates.length ? dates.reduce((a, b) => (a < b ? a : b)) : null;
  const lastAt = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null;

  return {
    repo,
    url: `https://github.com/${repo}`,
    stars,
    mergedPrs,
    prsOpened,
    commits,
    firstAt,
    lastAt,
    proofUrl: upstreamProofUrl(repo, mergedPrs),
    highlights,
  };
}

async function fetchUpstream(token: string | null): Promise<UpstreamStat[]> {
  const discovered = new Set<string>();
  let pageNum = 1;
  for (;;) {
    const params = new URLSearchParams({
      q: 'is:pr author:rodrigogs is:merged -user:rodrigogs',
      per_page: '100',
      page: String(pageNum),
    });
    const json = await githubSearchJson(`${GITHUB_API}/search/issues?${params.toString()}`, token);
    const items: any[] = json.items ?? [];
    for (const item of items) {
      const repositoryUrl: string = item.repository_url ?? '';
      const match = repositoryUrl.match(/repos\/(.+)$/);
      if (match?.[1]) discovered.add(match[1]);
    }
    if (items.length < 100) break;
    pageNum++;
    if (pageNum > 5) break; // safety cap; 30 req/min * throttle already bounds cost
  }

  const seedSet = new Set(UPSTREAM_SEED);
  const candidates = [...new Set([...UPSTREAM_SEED, ...discovered])].filter((repo) => !UPSTREAM_IGNORE.includes(repo));

  const rows: UpstreamStat[] = [];
  for (const repo of candidates) {
    try {
      const repoInfo = await githubJson(`${GITHUB_API}/repos/${repo}`, token);
      const stars: number = repoInfo.stargazers_count ?? 0;
      if (!seedSet.has(repo) && stars < UPSTREAM_MIN_STARS) continue;
      rows.push(await buildUpstreamRow(repo, stars, token));
    } catch (err) {
      console.error(`[github] upstream repo failed for ${repo}: ${(err as Error).message}`);
    }
  }
  return rows;
}

// ---------------------------------------------------------------------------
// GitHub source (user + repos + upstream), one unit for ok/error purposes
// ---------------------------------------------------------------------------

interface GithubData {
  user: UserStat;
  repos: RepoStat[];
  upstream: UpstreamStat[];
}

async function fetchGithubSource(token: string | null): Promise<GithubData> {
  const user = await fetchUserStat(token);

  const rawRepos = await githubJsonPaginated(`${GITHUB_API}/users/${GITHUB_LOGIN}/repos?type=owner`, token);
  const keptRaw = rawRepos.filter((r) => isPublicRepo(r) && shouldIncludeRepo(r));
  console.error(`[github] ${rawRepos.length} total repos seen, ${keptRaw.length} kept (public, non-fork or maintained fork)`);

  const repos = await mapWithConcurrency(keptRaw, 5, (raw) => buildRepoStat(raw, token));
  const upstream = await fetchUpstream(token);

  return {
    user,
    repos: sortByStarsThenName(repos),
    upstream: sortByStarsDesc(upstream),
  };
}

// ---------------------------------------------------------------------------
// npm
// ---------------------------------------------------------------------------

interface NpmSearchResult {
  name: string;
  version: string | null;
  description: string | null;
  repository: unknown;
}

async function searchNpmPackages(): Promise<NpmSearchResult[]> {
  const results: NpmSearchResult[] = [];
  const size = 250;
  let from = 0;
  for (;;) {
    const url = `https://registry.npmjs.org/-/v1/search?text=maintainer:${GITHUB_LOGIN}&size=${size}&from=${from}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`npm search ${res.status}`);
    const json: any = await res.json();
    const objects: any[] = json.objects ?? [];
    for (const o of objects) {
      results.push({
        name: o.package.name,
        version: o.package.version ?? null,
        description: o.package.description ?? null,
        repository: o.package.links?.repository,
      });
    }
    from += objects.length;
    if (objects.length < size || from >= (json.total ?? 0)) break;
  }
  return results;
}

async function fetchNpmDownloads(period: 'last-month' | 'last-year', names: string[]): Promise<Map<string, number>> {
  const result = new Map<string, number>();
  const { unscopedChunks, scoped } = chunkPackageNamesForDownloadsApi(names);

  for (const chunk of unscopedChunks) {
    const url = `https://api.npmjs.org/downloads/point/${period}/${chunk.join(',')}`;
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`npm downloads ${res.status}`);
      const json: any = await res.json();
      if (chunk.length === 1) {
        result.set(chunk[0] as string, json?.downloads ?? 0);
      } else {
        for (const name of chunk) {
          result.set(name, json[name]?.downloads ?? 0);
        }
      }
    } catch (err) {
      console.error(`[npm] downloads chunk failed (${period}): ${(err as Error).message}`);
      for (const name of chunk) result.set(name, result.get(name) ?? 0);
    }
  }

  await mapWithConcurrency(scoped, 5, async (name) => {
    const url = `https://api.npmjs.org/downloads/point/${period}/${encodeURIComponent(name)}`;
    try {
      const res = await fetch(url);
      if (!res.ok) {
        result.set(name, 0);
        return;
      }
      const json: any = await res.json();
      result.set(name, json?.downloads ?? 0);
    } catch (err) {
      console.error(`[npm] downloads failed for ${name} (${period}): ${(err as Error).message}`);
      result.set(name, 0);
    }
  });

  return result;
}

async function fetchNpmSource(): Promise<PackageStat[]> {
  const packages = await searchNpmPackages();
  const names = packages.map((p) => p.name);
  const monthly = await fetchNpmDownloads('last-month', names);
  const yearly = await fetchNpmDownloads('last-year', names);

  const result: PackageStat[] = packages.map((p) => ({
    registry: 'npm',
    name: p.name,
    url: `https://www.npmjs.com/package/${p.name}`,
    repo: repoNameFromRepositoryField(p.repository),
    description: p.description,
    version: p.version,
    monthlyDownloads: monthly.get(p.name) ?? 0,
    yearlyDownloads: yearly.get(p.name) ?? null,
    totalDownloads: null,
    excluded: isExcludedPackage(p.name, p.version),
  }));

  console.error(`[npm] ${result.length} packages found for maintainer:${GITHUB_LOGIN}`);
  return sortByDownloadsThenName(result);
}

// ---------------------------------------------------------------------------
// crates.io
// ---------------------------------------------------------------------------

async function fetchCratesSource(): Promise<PackageStat[]> {
  const results: PackageStat[] = [];
  for (const name of CRATES) {
    const url = `https://crates.io/api/v1/crates/${encodeURIComponent(name)}`;
    const res = await fetch(url, { headers: { 'user-agent': CRATES_USER_AGENT } });
    if (!res.ok) throw new Error(`crates.io ${res.status} for ${name}`);
    const json: any = await res.json();
    const crate = json.crate;
    const downloads = deriveCrateDownloads(crate);
    results.push({
      registry: 'crates',
      name: crate.name,
      url: `https://crates.io/crates/${crate.name}`,
      repo: repoNameFromRepositoryField(crate.repository),
      description: crate.description ?? null,
      version: crate.max_stable_version ?? crate.max_version ?? null,
      monthlyDownloads: downloads.monthlyDownloads,
      yearlyDownloads: downloads.yearlyDownloads,
      totalDownloads: downloads.totalDownloads,
      excluded: isExcludedPackage(crate.name, crate.max_version ?? null),
    });
  }
  console.error(`[crates] ${results.length} crates fetched`);
  return sortByDownloadsThenName(results);
}

// ---------------------------------------------------------------------------
// Snapshot assembly
// ---------------------------------------------------------------------------

async function loadPreviousSnapshot(): Promise<Snapshot | null> {
  try {
    const text = await readFile(SNAPSHOT_PATH, 'utf8');
    return JSON.parse(text) as Snapshot;
  } catch {
    return null;
  }
}

function computeTotals(repos: RepoStat[], packages: PackageStat[]): Totals {
  const included = packages.filter((p) => !p.excluded);
  return {
    stars: repos.reduce((sum, r) => sum + r.stars, 0),
    repos: repos.length,
    monthlyDownloads: included.reduce((sum, p) => sum + p.monthlyDownloads, 0),
    packages: included.length,
    releaseDownloads: repos.reduce((sum, r) => sum + r.releaseDownloads, 0),
  };
}

async function main(): Promise<void> {
  const now = new Date().toISOString();
  const previous = await loadPreviousSnapshot();
  const token = await resolveToken();
  if (!token) console.error('[auth] no GitHub token found (GITHUB_TOKEN / gh auth token); proceeding unauthenticated');
  else console.error('[auth] using a GitHub token');

  const emptyUser: UserStat = {
    login: GITHUB_LOGIN,
    name: 'Rodrigo Gomes da Silva',
    followers: 0,
    publicRepos: 0,
    createdAt: now,
    contributionsLastYear: null,
  };
  const previousGithub: GithubData = previous
    ? { user: previous.user, repos: previous.repos, upstream: previous.upstream }
    : { user: emptyUser, repos: [], upstream: [] };
  const previousNpm = previous?.packages.filter((p) => p.registry === 'npm') ?? [];
  const previousCrates = previous?.packages.filter((p) => p.registry === 'crates') ?? [];

  let githubAttempt: SourceAttempt<GithubData>;
  try {
    const data = await fetchGithubSource(token);
    githubAttempt = { ok: true, data };
    console.error(`[github] ok: ${data.repos.length} repos, ${data.upstream.length} upstream repos, user ${data.user.login}`);
  } catch (err) {
    githubAttempt = { ok: false, error: (err as Error).message };
    console.error(`[github] FAILED: ${(err as Error).message}`);
  }
  const github = resolveSource(previousGithub, previous?.sources.github, now, githubAttempt);

  let npmAttempt: SourceAttempt<PackageStat[]>;
  try {
    const data = await fetchNpmSource();
    npmAttempt = { ok: true, data };
  } catch (err) {
    npmAttempt = { ok: false, error: (err as Error).message };
    console.error(`[npm] FAILED: ${(err as Error).message}`);
  }
  const npm = resolveSource(previousNpm, previous?.sources.npm, now, npmAttempt);

  let cratesAttempt: SourceAttempt<PackageStat[]>;
  try {
    const data = await fetchCratesSource();
    cratesAttempt = { ok: true, data };
  } catch (err) {
    cratesAttempt = { ok: false, error: (err as Error).message };
    console.error(`[crates] FAILED: ${(err as Error).message}`);
  }
  const crates = resolveSource(previousCrates, previous?.sources.crates, now, cratesAttempt);

  const repos = sortByStarsThenName(github.data.repos);
  const upstream = sortByStarsDesc(github.data.upstream);
  const packages = sortByDownloadsThenName([...npm.data, ...crates.data]);
  const totals = computeTotals(repos, packages);

  const snapshot: Snapshot = {
    schemaVersion: 1,
    fetchedAt: now,
    sources: { github: github.status, npm: npm.status, crates: crates.status },
    user: github.data.user,
    repos,
    packages,
    upstream,
    totals,
  };

  const hasAnyData = previous !== null || github.status.ok || npm.status.ok || crates.status.ok;
  if (!hasAnyData) {
    console.error('[fetch-data] nothing could be fetched and no previous snapshot exists; not writing a snapshot');
    process.exitCode = 1;
    return;
  }

  await writeFile(SNAPSHOT_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.error(`[fetch-data] wrote ${SNAPSHOT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
