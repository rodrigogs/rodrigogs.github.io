/**
 * Pure, network-free helpers used by scripts/fetch-data.ts.
 *
 * Kept separate from fetch-data.ts so scripts/fetch-data.test.ts can exercise
 * the display-name mapping, exclusion heuristics, merge-on-failure behavior
 * and private-repo filtering without making any network calls.
 */

import type { SourceStatus } from '../../src/data/schema.ts';

// ---------------------------------------------------------------------------
// Constants (data-shaping decisions, kept together so they read as one list)
// ---------------------------------------------------------------------------

/** Forks that are actively maintained and should be treated like own repos. */
export const MAINTAINED_FORKS = ['mysql-events'];

/**
 * Public repos never shown or counted: legally disabled (DMCA takedown,
 * GitHub answers 451) or otherwise unfit for the showcase. GitHub's
 * `disabled` flag is honored too, so a future takedown drops out on its own.
 */
export const EXCLUDED_REPOS = ['ilsap'];

/** Upstream repos found by discovery but too trivial to present (list-entry PRs). */
export const UPSTREAM_IGNORE = ['InternetSemLimites/InternetSemLimites'];

/** npm packages that must never count toward totals or be shown as original work. */
export const EXCLUDED_PACKAGES = ['@rodrigogs/serverless', '@rodrigogs/adapter-nextjs'];

/** crates.io crate names owned by rodrigogs. */
export const CRATES = ['vibewatch'];

/** Seed list of upstream repos (not owned by rodrigogs) known to carry contributions. */
export const UPSTREAM_SEED = [
  'NousResearch/hermes-agent',
  'nesquena/hermes-webui',
  'RocketChat/Rocket.Chat',
  'moleculerjs/moleculer',
  'ACloudGuru/serverless-plugin-aws-alerts',
  'friedrith/node-wifi',
];

/** Minimum stars for a discovered (non-seed) upstream repo to be kept. */
export const UPSTREAM_MIN_STARS = 300;

// ---------------------------------------------------------------------------
// Display-name mapping (dependency name -> human label)
// ---------------------------------------------------------------------------

export const NPM_DISPLAY_NAMES: Record<string, string> = {
  express: 'Express',
  fastify: 'Fastify',
  koa: 'Koa',
  '@nestjs/core': 'NestJS',
  vue: 'Vue',
  nuxt: 'Nuxt',
  svelte: 'Svelte',
  '@sveltejs/kit': 'SvelteKit',
  react: 'React',
  next: 'Next.js',
  electron: 'Electron',
  '@angular/core': 'Angular',
  ionic: 'Ionic',
  jade: 'Jade',
  pug: 'Pug',
  mongoose: 'Mongoose',
  mongodb: 'MongoDB',
  pg: 'PostgreSQL',
  mysql: 'MySQL',
  mysql2: 'MySQL',
  redis: 'Redis',
  ioredis: 'Redis',
  prisma: 'Prisma',
  '@prisma/client': 'Prisma',
  '@supabase/supabase-js': 'Supabase',
  three: 'three.js',
  '@react-three/fiber': 'React Three Fiber',
  playwright: 'Playwright',
  '@playwright/test': 'Playwright',
  vitest: 'Vitest',
  jest: 'Jest',
  mocha: 'Mocha',
  '@biomejs/biome': 'Biome',
  eslint: 'ESLint',
  typescript: 'TypeScript',
  tailwindcss: 'Tailwind CSS',
  hono: 'Hono',
  serverless: 'Serverless Framework',
  'aws-sdk': 'AWS SDK',
  '@huggingface/transformers': 'Transformers.js',
  '@xenova/transformers': 'Transformers.js',
  langchain: 'LangChain',
  '@langchain/core': 'LangChain',
  '@langchain/langgraph': 'LangGraph',
  openai: 'OpenAI SDK',
  '@anthropic-ai/sdk': 'Anthropic SDK',
  '@whiskeysockets/baileys': 'Baileys',
  baileys: 'Baileys',
  puppeteer: 'Puppeteer',
  'socket.io': 'Socket.IO',
  graphql: 'GraphQL',
  keyv: 'Keyv',
  'semantic-release': 'semantic-release',
};

/** Scoped-package prefixes that map to one display name regardless of the exact package. */
export const NPM_PREFIX_DISPLAY_NAMES: [string, string][] = [
  ['@ionic/', 'Ionic'],
  ['@aws-sdk/', 'AWS SDK'],
];

export const CARGO_DISPLAY_NAMES: Record<string, string> = {
  tokio: 'Tokio',
  clap: 'clap',
  serde: 'Serde',
};

export const PYPROJECT_DISPLAY_NAMES: Record<string, string> = {
  pytest: 'pytest',
  fastapi: 'FastAPI',
  pydantic: 'Pydantic',
};

/**
 * Maps a set of raw dependency names to their sorted, unique display names
 * via an exact-match table plus optional scoped-prefix rules (e.g.
 * `@aws-sdk/client-s3` -> `AWS SDK`). Unknown names are dropped.
 */
export function mapNamesToDisplayNames(
  names: Iterable<string>,
  table: Record<string, string>,
  prefixes: [string, string][] = [],
): string[] {
  const out = new Set<string>();
  for (const name of names) {
    const exact = table[name];
    if (exact) {
      out.add(exact);
      continue;
    }
    const prefixHit = prefixes.find(([prefix]) => name.startsWith(prefix));
    if (prefixHit) out.add(prefixHit[1]);
  }
  return [...out].sort();
}

export interface PackageJsonManifest {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
}

/** Frameworks/libraries detected from a package.json's dependencies + devDependencies. */
export function frameworksFromPackageJson(pkg: PackageJsonManifest | null | undefined): string[] {
  if (!pkg) return [];
  const names = [...Object.keys(pkg.dependencies ?? {}), ...Object.keys(pkg.devDependencies ?? {})];
  return mapNamesToDisplayNames(names, NPM_DISPLAY_NAMES, NPM_PREFIX_DISPLAY_NAMES);
}

/** Simple workspace glob list from a package.json's `workspaces` field. */
export function workspaceGlobs(pkg: PackageJsonManifest | null | undefined): string[] {
  if (!pkg?.workspaces) return [];
  if (Array.isArray(pkg.workspaces)) return pkg.workspaces;
  return pkg.workspaces.packages ?? [];
}

/**
 * Resolves simple globs like `packages/*` to a directory prefix so callers
 * can list that directory via the contents API. Only the trailing `/*`
 * pattern is supported (sufficient for typical monorepo layouts); anything
 * else is dropped.
 */
export function resolveSimpleWorkspaceDir(glob: string): string | null {
  const match = glob.match(/^([^*]+)\/\*$/);
  return match?.[1] ?? null;
}

/**
 * Extracts dependency table names from a Cargo.toml source. Handles both
 * inline (`serde = "1.0"`) and table (`serde = { version = "1.0" }`) forms
 * under `[dependencies]`, `[dev-dependencies]` and `[build-dependencies]`
 * (including their `target.*` variants).
 */
export function parseCargoDependencyNames(cargoToml: string): string[] {
  const names: string[] = [];
  let inDepsTable = false;
  for (const rawLine of cargoToml.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^\[.*\]$/.test(line)) {
      const header = line.slice(1, -1);
      // Nested form: [dependencies.serde] or [target.'cfg(unix)'.dev-dependencies.tokio]
      const nested = header.match(/(?:^|\.)(dependencies|dev-dependencies|build-dependencies)\.([A-Za-z0-9_-]+)$/);
      if (nested?.[2]) {
        names.push(nested[2]);
        inDepsTable = false;
        continue;
      }
      inDepsTable = /(?:^|\.)(dependencies|dev-dependencies|build-dependencies)$/.test(header);
      continue;
    }
    if (!inDepsTable) continue;
    const match = line.match(/^([A-Za-z0-9_-]+)\s*=/);
    if (match?.[1]) names.push(match[1]);
  }
  return names;
}

export function frameworksFromCargoToml(cargoToml: string): string[] {
  return mapNamesToDisplayNames(parseCargoDependencyNames(cargoToml), CARGO_DISPLAY_NAMES);
}

/**
 * Extracts dependency names from a pyproject.toml source. Supports the PEP
 * 621 array form (`dependencies = ["fastapi>=0.100", ...]`) and Poetry's
 * table form (`[tool.poetry.dependencies]` / `.dev-dependencies`).
 */
export function parsePyprojectDependencyNames(pyproject: string): string[] {
  const names = new Set<string>();

  const arrayMatch = pyproject.match(/dependencies\s*=\s*\[([^\]]*)\]/s);
  if (arrayMatch?.[1] !== undefined) {
    const items = arrayMatch[1].match(/["']([^"']+)["']/g) ?? [];
    for (const item of items) {
      const raw = item.slice(1, -1);
      const name = raw.split(/[\s<>=!~;[]/)[0]?.trim().toLowerCase();
      if (name) names.add(name);
    }
  }

  let inTable = false;
  for (const rawLine of pyproject.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#')) continue;
    if (/^\[.*\]$/.test(line)) {
      inTable = /^\[tool\.poetry\.(dev-)?dependencies\]$/.test(line);
      continue;
    }
    if (!inTable) continue;
    const match = line.match(/^([A-Za-z0-9_.-]+)\s*=/);
    if (match?.[1]) names.add(match[1].toLowerCase());
  }

  return [...names];
}

export function frameworksFromPyprojectToml(pyproject: string): string[] {
  return mapNamesToDisplayNames(parsePyprojectDependencyNames(pyproject), PYPROJECT_DISPLAY_NAMES);
}

// ---------------------------------------------------------------------------
// Repo filtering
// ---------------------------------------------------------------------------

export interface RawRepoVisibility {
  private?: boolean;
  visibility?: string;
}

/** True only for repos GitHub reports as public; fails closed on unknown data. */
export function isPublicRepo(repo: RawRepoVisibility): boolean {
  if (typeof repo.private === 'boolean') return repo.private === false;
  if (repo.visibility) return repo.visibility === 'public';
  return false;
}

/**
 * Keep non-forks, plus forks explicitly maintained (see MAINTAINED_FORKS);
 * drop disabled repos and EXCLUDED_REPOS.
 */
export function shouldIncludeRepo(repo: { name: string; fork: boolean; disabled?: boolean }): boolean {
  if (repo.disabled === true || EXCLUDED_REPOS.includes(repo.name)) return false;
  return !repo.fork || MAINTAINED_FORKS.includes(repo.name);
}

// ---------------------------------------------------------------------------
// Releases
// ---------------------------------------------------------------------------

export interface RawReleaseAsset {
  download_count: number;
}

export interface RawRelease {
  draft: boolean;
  prerelease: boolean;
  tag_name: string;
  name: string | null;
  published_at: string;
  html_url: string;
  assets: RawReleaseAsset[];
}

export interface LatestReleaseInfo {
  tag: string;
  name: string | null;
  publishedAt: string;
  url: string;
}

/** First non-draft, non-prerelease release, assuming API order (newest first). */
export function pickLatestRelease(releases: RawRelease[]): LatestReleaseInfo | null {
  const hit = releases.find((r) => !r.draft && !r.prerelease);
  if (!hit) return null;
  return { tag: hit.tag_name, name: hit.name ?? null, publishedAt: hit.published_at, url: hit.html_url };
}

export function sumReleaseDownloads(releases: RawRelease[]): number {
  return releases.reduce((sum, r) => sum + r.assets.reduce((s, a) => s + a.download_count, 0), 0);
}

// ---------------------------------------------------------------------------
// npm package exclusion + downloads batching
// ---------------------------------------------------------------------------

export function isExcludedPackage(name: string, version: string | null | undefined): boolean {
  if (EXCLUDED_PACKAGES.includes(name)) return true;
  if (version && /^0\.0\./.test(version)) return true;
  if (version && /patched/i.test(version)) return true;
  return false;
}

/** Splits package names into unscoped chunks (<= `size` each) and scoped singles. */
export function chunkPackageNamesForDownloadsApi(
  names: string[],
  size = 128,
): { unscopedChunks: string[][]; scoped: string[] } {
  const unscoped = names.filter((n) => !n.startsWith('@'));
  const scoped = names.filter((n) => n.startsWith('@'));
  const unscopedChunks: string[][] = [];
  for (let i = 0; i < unscoped.length; i += size) {
    unscopedChunks.push(unscoped.slice(i, i + size));
  }
  return { unscopedChunks, scoped };
}

/** Extracts a rodrigogs/<repo> name from an npm `repository` field, else null. */
export function repoNameFromRepositoryField(repository: unknown): string | null {
  let url: string | undefined;
  if (typeof repository === 'string') {
    url = repository;
  } else if (repository && typeof repository === 'object' && 'url' in repository) {
    url = (repository as { url?: string }).url;
  }
  if (!url) return null;
  const match = url.match(/github\.com[/:]rodrigogs\/([^/?#]+)/i);
  if (!match?.[1]) return null;
  return match[1].replace(/\.git$/i, '');
}

// ---------------------------------------------------------------------------
// crates.io
// ---------------------------------------------------------------------------

export interface RawCrate {
  downloads: number;
  recent_downloads?: number | null;
}

export function deriveCrateDownloads(crate: RawCrate): {
  monthlyDownloads: number;
  totalDownloads: number;
  yearlyDownloads: null;
} {
  const recent = crate.recent_downloads ?? 0;
  return {
    monthlyDownloads: Math.round(recent / 3),
    totalDownloads: crate.downloads,
    yearlyDownloads: null,
  };
}

// ---------------------------------------------------------------------------
// Upstream
// ---------------------------------------------------------------------------

export function upstreamProofUrl(repo: string, mergedPrs: number): string {
  if (mergedPrs > 0) return `https://github.com/${repo}/pulls?q=is%3Apr+author%3Arodrigogs`;
  return `https://github.com/${repo}/commits?author=rodrigogs`;
}

// ---------------------------------------------------------------------------
// Source resolution (merge-with-previous on failure)
// ---------------------------------------------------------------------------

export type SourceAttempt<T> = { ok: true; data: T } | { ok: false; error: string };

export interface ResolvedSource<T> {
  data: T;
  status: SourceStatus;
}

/**
 * Resolves one snapshot source (github/npm/crates) against its previous
 * value: on success, returns the fresh data with `ok: true`; on failure,
 * keeps the previous data untouched, carries forward the previous
 * `lastSuccessAt` and marks `ok: false` with the new error.
 */
export function resolveSource<T>(
  previousData: T,
  previousStatus: SourceStatus | undefined,
  now: string,
  attempt: SourceAttempt<T>,
): ResolvedSource<T> {
  if (attempt.ok) {
    return { data: attempt.data, status: { ok: true, lastSuccessAt: now } };
  }
  return {
    data: previousData,
    status: {
      ok: false,
      lastSuccessAt: previousStatus?.lastSuccessAt ?? null,
      error: attempt.error,
    },
  };
}

// ---------------------------------------------------------------------------
// Stable ordering
// ---------------------------------------------------------------------------

export function sortByStarsThenName<T extends { stars: number; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.stars - a.stars || a.name.localeCompare(b.name));
}

export function sortByDownloadsThenName<T extends { monthlyDownloads: number; name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.monthlyDownloads - a.monthlyDownloads || a.name.localeCompare(b.name));
}

export function sortByStarsDesc<T extends { stars: number }>(items: T[]): T[] {
  return [...items].sort((a, b) => b.stars - a.stars);
}
