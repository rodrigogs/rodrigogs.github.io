/**
 * Pure, dependency-free helpers derived from `Snapshot`. Consumed by the
 * site pages and by the SVG card renderer (scripts/render-cards.ts), so
 * both draw the exact same conclusions from the exact same data.
 */

import type { PackageStat, RepoStat, Snapshot } from '../data/schema.ts';

/**
 * Languages that are markup, tooling glue or config noise rather than a
 * technology worth surfacing as "tech used".
 */
const NOISE_LANGUAGES = new Set([
  'HTML',
  'CSS',
  'SCSS',
  'Shell',
  'Dockerfile',
  'Makefile',
  'Batchfile',
  'PowerShell',
  'Procfile',
  'EJS',
  'Handlebars',
  'Nunjucks',
  'ApacheConf',
  'ShaderLab',
  'HLSL',
  'GLSL',
  'Roff',
  'Vim Script',
  'Nginx',
  'Smarty',
  'Less',
  'Stylus',
]);

/** Minimum share of a repo's language bytes for a language to count as "used". */
const LANGUAGE_SHARE_THRESHOLD = 0.1;
/** Absolute byte floor that also qualifies a language regardless of share. */
const LANGUAGE_BYTES_FLOOR = 20_000;

/**
 * Technologies actually used in a repo: languages that are at least 10% of
 * the repo's bytes or at least 20,000 bytes (excluding markup/tooling
 * noise), plus the frameworks/libraries detected in its manifest. Unique,
 * sorted.
 */
export function techOfRepo(repo: RepoStat): string[] {
  return [...new Set([...languagesOfRepo(repo), ...repo.frameworks])].sort();
}

/** The language half of `techOfRepo`: stable across a repo's life. */
export function languagesOfRepo(repo: RepoStat): string[] {
  const total = Object.values(repo.languages).reduce((sum, bytes) => sum + bytes, 0);
  return Object.entries(repo.languages)
    .filter(([lang]) => !NOISE_LANGUAGES.has(lang))
    .filter(([, bytes]) => (total > 0 && bytes / total >= LANGUAGE_SHARE_THRESHOLD) || bytes >= LANGUAGE_BYTES_FLOOR)
    .map(([lang]) => lang)
    .sort();
}

/**
 * Years a repo counts as "in use": from its creation year through
 * min(pushed year, created year + 2) — a repo is active at birth and for
 * its first two years even if pushes slow down — plus the year of its most
 * recent push, however long after that it happened.
 */
export function activeYears(repo: RepoStat): number[] {
  const createdYear = new Date(repo.createdAt).getUTCFullYear();
  const pushedYear = new Date(repo.pushedAt).getUTCFullYear();
  const endYear = Math.min(pushedYear, createdYear + 2);

  const years = new Set<number>();
  for (let year = createdYear; year <= endYear; year++) years.add(year);
  years.add(pushedYear);

  return [...years].sort((a, b) => a - b);
}

export interface CareerStackRange {
  from: number;
  to: number;
  stack: string[];
}

/**
 * Union over repos active in each year in range, plus any
 * curated `extra` career-stack ranges supplied by the content layer (e.g.
 * "Java/Grails at Safetech, 2011-2015"). Defaults to [earliest observed
 * year, current year] when `opts` doesn't pin the range.
 */
export function stackByYear(
  repos: RepoStat[],
  extra: CareerStackRange[],
  opts?: { minYear?: number; maxYear?: number },
): Record<number, string[]> {
  const currentYear = new Date().getUTCFullYear();
  // Languages hold for every active year. Frameworks come from the manifest
  // as it is today, so they only count in the year of the last push:
  // otherwise a 2018 repo still maintained in 2026 would claim a 2023 tool
  // (Biome, say) back in 2018.
  const repoActivity = repos.map((repo) => ({
    repo,
    years: activeYears(repo),
    languages: languagesOfRepo(repo),
    pushedYear: new Date(repo.pushedAt).getUTCFullYear(),
  }));

  const observedYears = [...repoActivity.flatMap((r) => r.years), ...extra.flatMap((e) => [e.from, e.to])];
  const minYear = opts?.minYear ?? (observedYears.length ? Math.min(...observedYears) : currentYear);
  const maxYear = opts?.maxYear ?? currentYear;

  const result: Record<number, string[]> = {};
  for (let year = minYear; year <= maxYear; year++) {
    const techs = new Set<string>();
    for (const { repo, years, languages, pushedYear } of repoActivity) {
      if (!years.includes(year)) continue;
      for (const lang of languages) techs.add(lang);
      if (year === pushedYear) for (const fw of repo.frameworks) techs.add(fw);
    }
    for (const range of extra) {
      if (year >= range.from && year <= range.to) {
        for (const tech of range.stack) techs.add(tech);
      }
    }
    result[year] = [...techs].sort();
  }
  return result;
}

/** Alphabetically sorted added/removed/kept between two stacks. */
export function diffStacks(base: string[], head: string[]): { added: string[]; removed: string[]; kept: string[] } {
  const baseSet = new Set(base);
  const headSet = new Set(head);
  return {
    added: head.filter((t) => !baseSet.has(t)).sort(),
    removed: base.filter((t) => !headSet.has(t)).sort(),
    kept: base.filter((t) => headSet.has(t)).sort(),
  };
}

/**
 * Best-effort activity counts for a [from, to] year range, derived from
 * `createdAt` since that is the only reliably dated field on hand.
 */
export function diffWork(
  repos: RepoStat[],
  packages: PackageStat[],
  from: number,
  to: number,
): { reposCreated: number; releases: number; packagesPublished: number } {
  const yearOf = (iso: string) => new Date(iso).getUTCFullYear();
  const inRange = (iso: string) => {
    const year = yearOf(iso);
    return year >= from && year <= to;
  };

  const reposCreated = repos.filter((r) => inRange(r.createdAt)).length;

  // "releases in range" heuristic: the snapshot only carries the latest
  // release per repo, not full release history, so `releaseCount` of repos
  // created in range would be wrong in both directions — it would miss
  // releases shipped by older repos during this range, and it would count
  // every historical release of a repo merely because the repo was born in
  // range. Instead, count a repo as having release activity in range when
  // its latest release was published in range; repos with no releases at
  // all fall back to counting as activity when they were created in range
  // (best-effort proxy for "started shipping during this period").
  const releases = repos.filter((r) => {
    if (r.latestRelease) return inRange(r.latestRelease.publishedAt);
    return r.releaseCount === 0 && inRange(r.createdAt);
  }).length;

  // No publish date is carried for npm/crates packages, so "published in
  // range" is approximated through the linked repo's createdAt.
  const packagesPublished = packages.filter(
    (p) => !p.excluded && p.repo && repos.some((r) => r.name === p.repo && inRange(r.createdAt)),
  ).length;

  return { reposCreated, releases, packagesPublished };
}

/** `1.2k` (en) / `1,2 mil` (pt) style compact formatting. */
export function compact(n: number, locale: 'en' | 'pt'): string {
  const intlLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(intlLocale, { notation: 'compact', maximumFractionDigits: 1 }).format(n);
}

/** Locale-formatted integer with thousands separators. */
export function formatInt(n: number, locale: 'en' | 'pt'): string {
  const intlLocale = locale === 'pt' ? 'pt-BR' : 'en-US';
  return new Intl.NumberFormat(intlLocale).format(n);
}

const STALE_AFTER_DAYS = 3;

/** Age of a snapshot in whole days, and whether it's stale (> 3 days old). */
export function snapshotAge(snapshot: Snapshot, now: Date): { days: number; stale: boolean } {
  const fetchedAt = new Date(snapshot.fetchedAt);
  const ms = now.getTime() - fetchedAt.getTime();
  const days = Math.floor(ms / (24 * 60 * 60 * 1000));
  return { days, stale: days > STALE_AFTER_DAYS };
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Start (Sunday, UTC, "YYYY-MM-DD") of each week in a contribution
 * calendar of `count` weeks whose last week contains `fetchedAt`, oldest
 * first. GitHub's calendar weeks run Sunday to Saturday.
 */
export function contributionWeekStarts(fetchedAt: string, count: number): string[] {
  const at = new Date(fetchedAt);
  const lastSunday = Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), at.getUTCDate() - at.getUTCDay());
  return Array.from({ length: count }, (_, i) => new Date(lastSunday - (count - 1 - i) * WEEK_MS).toISOString().slice(0, 10));
}

/** The busiest week (the earliest one on a tie), or null when there is no activity at all. */
export function bestWeek(weeks: readonly number[]): { index: number; count: number } | null {
  let index = -1;
  let count = 0;
  weeks.forEach((n, i) => {
    if (n > count) {
      count = n;
      index = i;
    }
  });
  return index < 0 ? null : { index, count };
}
