/**
 * Data contract between scripts/fetch-data.ts (producer) and the site and
 * card renderer (consumers).
 *
 * `src/data/snapshot.json` is committed. Every scheduled build refreshes it;
 * when a source fails, the previous values for that source are kept and
 * `sources[source].ok` is false with the time of the last good fetch, so the
 * page can say how old a number is instead of showing a wrong one.
 */

export interface SourceStatus {
  ok: boolean;
  /** ISO timestamp of the last successful fetch for this source. */
  lastSuccessAt: string | null;
  /** Short error message from the last failed attempt, if any. */
  error?: string;
}

export interface Snapshot {
  schemaVersion: 1;
  /** ISO timestamp of this run. */
  fetchedAt: string;
  sources: {
    github: SourceStatus;
    npm: SourceStatus;
    crates: SourceStatus;
  };
  user: UserStat;
  repos: RepoStat[];
  packages: PackageStat[];
  upstream: UpstreamStat[];
  totals: Totals;
}

export interface UserStat {
  login: string;
  name: string;
  followers: number;
  publicRepos: number;
  /** Account creation, ISO. */
  createdAt: string;
  /** Contributions in the last 12 months (GitHub contribution calendar), null when unavailable. */
  contributionsLastYear: number | null;
}

export interface ReleaseInfo {
  tag: string;
  name: string | null;
  publishedAt: string;
  url: string;
}

export interface RepoStat {
  /** Repo name without owner, e.g. "whats-reader". */
  name: string;
  /** "owner/name". */
  fullName: string;
  url: string;
  description: string | null;
  homepage: string | null;
  stars: number;
  forks: number;
  /** Primary language as reported by GitHub. */
  language: string | null;
  /** Language breakdown in bytes, from /languages. */
  languages: Record<string, number>;
  topics: string[];
  /**
   * Frameworks and notable libraries detected from the manifest
   * (package.json dependencies, Cargo.toml, pyproject.toml), normalized to
   * display names, e.g. ["SvelteKit", "Electron", "Vitest"].
   */
  frameworks: string[];
  createdAt: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
  license: string | null;
  latestRelease: ReleaseInfo | null;
  releaseCount: number;
  /** Sum of asset download_count across all releases. */
  releaseDownloads: number;
}

export interface PackageStat {
  registry: 'npm' | 'crates';
  name: string;
  url: string;
  /** Linked GitHub repo name (without owner) when known. */
  repo: string | null;
  description: string | null;
  version: string | null;
  /** Downloads in the last 30 days (npm last-month; crates: recent 90 days / 3, rounded). */
  monthlyDownloads: number;
  /** Downloads in the last 365 days (npm) or all-time (crates, see totalDownloads). */
  yearlyDownloads: number | null;
  totalDownloads: number | null;
  /**
   * True for placeholders, forks-as-packages and patches (0.0.x name holds,
   * "-patched" versions) that must not be counted or shown as original work.
   */
  excluded: boolean;
}

export interface UpstreamStat {
  /** "owner/name" of a repo NOT owned by rodrigogs. */
  repo: string;
  url: string;
  stars: number;
  /** PRs authored by rodrigogs and merged through GitHub. */
  mergedPrs: number;
  /** PRs authored by rodrigogs, any state. */
  prsOpened: number;
  /** Commits authored by rodrigogs present in the default branch (search/commits). */
  commits: number;
  firstAt: string | null;
  lastAt: string | null;
  /** Where a visitor can verify it (PR search or commit search URL). */
  proofUrl: string;
  /** Titles of merged PRs (most recent first), max 8. */
  highlights: { title: string; url: string; mergedAt: string }[];
}

export interface Totals {
  /** Stars across public non-fork repos plus maintained forks listed in MAINTAINED_FORKS. */
  stars: number;
  /** Non-fork public repos. */
  repos: number;
  /** Sum of monthlyDownloads across packages where excluded === false. */
  monthlyDownloads: number;
  /** Count of packages where excluded === false. */
  packages: number;
  /** Sum of releaseDownloads across repos. */
  releaseDownloads: number;
}
