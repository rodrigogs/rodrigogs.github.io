import { describe, expect, it } from 'vitest';
import {
  CONTRIBUTION_WEEKS,
  chunkPackageNamesForDownloadsApi,
  deriveCrateDownloads,
  frameworksFromCargoToml,
  frameworksFromPackageJson,
  frameworksFromPyprojectToml,
  isExcludedPackage,
  isPublicRepo,
  mapNamesToDisplayNames,
  pickLatestRelease,
  repoNameFromRepositoryField,
  resolveSource,
  shouldIncludeRepo,
  sortByDownloadsThenName,
  sortByStarsDesc,
  sortByStarsThenName,
  sumReleaseDownloads,
  upstreamProofUrl,
  weeklyContributionTotals,
  workspaceGlobs,
  resolveSimpleWorkspaceDir,
} from './lib/fetch-helpers.ts';

describe('mapNamesToDisplayNames / frameworksFromPackageJson', () => {
  it('maps known dependencies to display names, sorted and unique', () => {
    const names = frameworksFromPackageJson({
      dependencies: { react: '^18.0.0', 'next': '^14.0.0' },
      devDependencies: { vitest: '^1.0.0', typescript: '^5.0.0' },
    });
    expect(names).toEqual(['Next.js', 'React', 'TypeScript', 'Vitest']);
  });

  it('drops unknown dependencies', () => {
    const names = frameworksFromPackageJson({ dependencies: { 'left-pad': '^1.0.0' } });
    expect(names).toEqual([]);
  });

  it('maps scoped-prefix packages like @aws-sdk/* and @ionic/*', () => {
    const names = frameworksFromPackageJson({
      dependencies: { '@aws-sdk/client-s3': '^3.0.0', '@ionic/core': '^7.0.0' },
    });
    expect(names).toEqual(['AWS SDK', 'Ionic']);
  });

  it('is empty for a null/undefined manifest', () => {
    expect(frameworksFromPackageJson(null)).toEqual([]);
    expect(frameworksFromPackageJson(undefined)).toEqual([]);
  });

  it('mapNamesToDisplayNames deduplicates across sources', () => {
    expect(mapNamesToDisplayNames(['mysql', 'mysql2', 'redis', 'ioredis'], { mysql: 'MySQL', mysql2: 'MySQL', redis: 'Redis', ioredis: 'Redis' })).toEqual([
      'MySQL',
      'Redis',
    ]);
  });
});

describe('workspaceGlobs / resolveSimpleWorkspaceDir', () => {
  it('reads array-form workspaces', () => {
    expect(workspaceGlobs({ workspaces: ['packages/*'] })).toEqual(['packages/*']);
  });

  it('reads object-form workspaces', () => {
    expect(workspaceGlobs({ workspaces: { packages: ['apps/*', 'packages/*'] } })).toEqual(['apps/*', 'packages/*']);
  });

  it('resolves a trailing /* glob to its directory', () => {
    expect(resolveSimpleWorkspaceDir('packages/*')).toBe('packages');
  });

  it('returns null for globs it cannot resolve simply', () => {
    expect(resolveSimpleWorkspaceDir('packages/**')).toBeNull();
  });
});

describe('frameworksFromCargoToml', () => {
  it('reads inline dependencies table', () => {
    const toml = `
[package]
name = "vibewatch"

[dependencies]
tokio = { version = "1", features = ["full"] }
serde = "1.0"
left-pad = "1.0"

[dev-dependencies]
clap = "4.0"
`;
    expect(frameworksFromCargoToml(toml)).toEqual(['Serde', 'Tokio', 'clap']);
  });

  it('reads nested dotted dependency tables', () => {
    const toml = `
[dependencies.serde]
version = "1.0"

[dependencies.tokio]
version = "1"
`;
    expect(frameworksFromCargoToml(toml)).toEqual(['Serde', 'Tokio']);
  });
});

describe('frameworksFromPyprojectToml', () => {
  it('reads PEP 621 array dependencies', () => {
    const pyproject = `
[project]
name = "sample"
dependencies = [
  "fastapi>=0.100",
  "pydantic~=2.0",
  "left-pad",
]
`;
    expect(frameworksFromPyprojectToml(pyproject)).toEqual(['FastAPI', 'Pydantic']);
  });

  it('reads Poetry table dependencies', () => {
    const pyproject = `
[tool.poetry.dependencies]
python = "^3.11"
fastapi = "^0.100"

[tool.poetry.dev-dependencies]
pytest = "^7.0"
`;
    expect(frameworksFromPyprojectToml(pyproject)).toEqual(['FastAPI', 'pytest']);
  });
});

describe('isExcludedPackage', () => {
  it('excludes the explicit EXCLUDED_PACKAGES list', () => {
    expect(isExcludedPackage('@rodrigogs/serverless', '1.0.0')).toBe(true);
    expect(isExcludedPackage('@rodrigogs/adapter-nextjs', '1.0.0')).toBe(true);
  });

  it('excludes 0.0.x placeholder versions', () => {
    expect(isExcludedPackage('@rodrigogs/something', '0.0.3')).toBe(true);
  });

  it('excludes versions with "patched" in them', () => {
    expect(isExcludedPackage('@rodrigogs/something', '1.2.3-patched.0')).toBe(true);
  });

  it('does not exclude adult-site scraper libraries by subject matter', () => {
    expect(isExcludedPackage('xvideos-api', '1.4.0')).toBe(false);
    expect(isExcludedPackage('pornhub-api', '2.0.0')).toBe(false);
    expect(isExcludedPackage('sxyprn-api', '1.0.0')).toBe(false);
  });

  it('does not exclude a normal package', () => {
    expect(isExcludedPackage('@rodrigogs/mysql-events', '9.0.0')).toBe(false);
  });
});

describe('isPublicRepo / shouldIncludeRepo', () => {
  it('keeps only private === false', () => {
    expect(isPublicRepo({ private: false })).toBe(true);
    expect(isPublicRepo({ private: true })).toBe(false);
  });

  it('falls back to visibility === "public"', () => {
    expect(isPublicRepo({ visibility: 'public' })).toBe(true);
    expect(isPublicRepo({ visibility: 'private' })).toBe(false);
    expect(isPublicRepo({ visibility: 'internal' })).toBe(false);
  });

  it('fails closed on unknown visibility data', () => {
    expect(isPublicRepo({})).toBe(false);
  });

  it('keeps non-forks and drops unmaintained forks', () => {
    expect(shouldIncludeRepo({ name: 'whats-reader', fork: false })).toBe(true);
    expect(shouldIncludeRepo({ name: 'some-fork', fork: true })).toBe(false);
  });

  it('keeps maintained forks (mysql-events)', () => {
    expect(shouldIncludeRepo({ name: 'mysql-events', fork: true })).toBe(true);
  });

  it('drops disabled (DMCA) repos and the explicit exclusion list', () => {
    expect(shouldIncludeRepo({ name: 'ilsap', fork: false })).toBe(false);
    expect(shouldIncludeRepo({ name: 'taken-down', fork: false, disabled: true })).toBe(false);
    expect(shouldIncludeRepo({ name: 'whats-reader', fork: false, disabled: false })).toBe(true);
  });
});

describe('pickLatestRelease / sumReleaseDownloads', () => {
  const releases = [
    { draft: false, prerelease: true, tag_name: 'v2.0.0-beta', name: null, published_at: '2024-02-01T00:00:00Z', html_url: 'https://x/beta', assets: [] },
    { draft: false, prerelease: false, tag_name: 'v1.31.0', name: 'v1.31.0', published_at: '2024-01-01T00:00:00Z', html_url: 'https://x/1.31.0', assets: [{ download_count: 100 }, { download_count: 50 }] },
    { draft: true, prerelease: false, tag_name: 'v1.30.0', name: null, published_at: '2023-01-01T00:00:00Z', html_url: 'https://x/1.30.0', assets: [{ download_count: 10 }] },
  ];

  it('picks the first non-draft, non-prerelease release', () => {
    expect(pickLatestRelease(releases)).toEqual({ tag: 'v1.31.0', name: 'v1.31.0', publishedAt: '2024-01-01T00:00:00Z', url: 'https://x/1.31.0' });
  });

  it('returns null when there is no qualifying release', () => {
    expect(pickLatestRelease([releases[0]!, releases[2]!])).toBeNull();
  });

  it('sums asset download counts across all releases regardless of draft/prerelease', () => {
    expect(sumReleaseDownloads(releases)).toBe(160);
  });
});

describe('repoNameFromRepositoryField', () => {
  it('extracts a repo name from a github.com string URL', () => {
    expect(repoNameFromRepositoryField('https://github.com/rodrigogs/whats-reader')).toBe('whats-reader');
  });

  it('extracts a repo name from a repository.url object', () => {
    expect(repoNameFromRepositoryField({ url: 'git+https://github.com/rodrigogs/mysql-events.git' })).toBe('mysql-events');
  });

  it('returns null for a non-rodrigogs repository', () => {
    expect(repoNameFromRepositoryField('https://github.com/someoneelse/thing')).toBeNull();
  });

  it('returns null when there is no repository field', () => {
    expect(repoNameFromRepositoryField(null)).toBeNull();
    expect(repoNameFromRepositoryField(undefined)).toBeNull();
  });
});

describe('chunkPackageNamesForDownloadsApi', () => {
  it('splits unscoped names into chunks and keeps scoped names separate', () => {
    const names = ['a', 'b', '@rodrigogs/c', '@rodrigogs/d'];
    const { unscopedChunks, scoped } = chunkPackageNamesForDownloadsApi(names, 1);
    expect(unscopedChunks).toEqual([['a'], ['b']]);
    expect(scoped).toEqual(['@rodrigogs/c', '@rodrigogs/d']);
  });

  it('defaults to chunks of 128', () => {
    const names = Array.from({ length: 130 }, (_, i) => `pkg-${i}`);
    const { unscopedChunks } = chunkPackageNamesForDownloadsApi(names);
    expect(unscopedChunks.length).toBe(2);
    expect(unscopedChunks[0]?.length).toBe(128);
    expect(unscopedChunks[1]?.length).toBe(2);
  });
});

describe('deriveCrateDownloads', () => {
  it('divides recent_downloads by 3 for monthlyDownloads and passes totalDownloads through', () => {
    expect(deriveCrateDownloads({ downloads: 1375, recent_downloads: 300 })).toEqual({
      monthlyDownloads: 100,
      totalDownloads: 1375,
      yearlyDownloads: null,
    });
  });

  it('rounds and defaults recent_downloads to 0 when missing', () => {
    expect(deriveCrateDownloads({ downloads: 10 })).toEqual({ monthlyDownloads: 0, totalDownloads: 10, yearlyDownloads: null });
  });
});

describe('upstreamProofUrl', () => {
  it('links to the PR search when there are merged PRs', () => {
    expect(upstreamProofUrl('nesquena/hermes-webui', 5)).toBe('https://github.com/nesquena/hermes-webui/pulls?q=is%3Apr+author%3Arodrigogs');
  });

  it('links to the commit search when there are no merged PRs', () => {
    expect(upstreamProofUrl('NousResearch/hermes-agent', 0)).toBe('https://github.com/NousResearch/hermes-agent/commits?author=rodrigogs');
  });
});

describe('resolveSource', () => {
  it('returns fresh data and ok: true on success', () => {
    const result = resolveSource('old', { ok: false, lastSuccessAt: '2026-09-01T00:00:00Z', error: 'boom' }, '2026-09-28T00:00:00Z', {
      ok: true,
      data: 'new',
    });
    expect(result).toEqual({ data: 'new', status: { ok: true, lastSuccessAt: '2026-09-28T00:00:00Z' } });
  });

  it('keeps previous data and lastSuccessAt on failure, and records the error', () => {
    const result = resolveSource('old', { ok: true, lastSuccessAt: '2026-09-01T00:00:00Z' }, '2026-09-28T00:00:00Z', {
      ok: false,
      error: 'rate limited',
    });
    expect(result).toEqual({
      data: 'old',
      status: { ok: false, lastSuccessAt: '2026-09-01T00:00:00Z', error: 'rate limited' },
    });
  });

  it('has lastSuccessAt null when there was never a previous success', () => {
    const result = resolveSource('old', undefined, '2026-09-28T00:00:00Z', { ok: false, error: 'boom' });
    expect(result.status.lastSuccessAt).toBeNull();
  });
});

describe('stable ordering helpers', () => {
  it('sorts by stars desc then name asc', () => {
    const items = [
      { name: 'b', stars: 10 },
      { name: 'a', stars: 10 },
      { name: 'c', stars: 20 },
    ];
    expect(sortByStarsThenName(items).map((i) => i.name)).toEqual(['c', 'a', 'b']);
  });

  it('sorts packages by monthlyDownloads desc then name asc', () => {
    const items = [
      { name: 'b', monthlyDownloads: 5 },
      { name: 'a', monthlyDownloads: 5 },
      { name: 'c', monthlyDownloads: 10 },
    ];
    expect(sortByDownloadsThenName(items).map((i) => i.name)).toEqual(['c', 'a', 'b']);
  });

  it('sorts upstream by stars desc', () => {
    const items = [{ stars: 5 }, { stars: 500 }, { stars: 50 }];
    expect(sortByStarsDesc(items).map((i) => i.stars)).toEqual([500, 50, 5]);
  });
});

describe('weeklyContributionTotals', () => {
  const week = (...days: number[]) => ({ contributionDays: days.map((contributionCount) => ({ contributionCount })) });

  it('sums each week, oldest first', () => {
    expect(weeklyContributionTotals([week(1, 2, 3), week(0, 0), week(5)])).toEqual([6, 0, 5]);
  });

  it('keeps only the last 53 weeks', () => {
    const weeks = Array.from({ length: 54 }, (_, i) => week(i));
    const out = weeklyContributionTotals(weeks)!;
    expect(out).toHaveLength(CONTRIBUTION_WEEKS);
    expect(out[0]).toBe(1);
    expect(out.at(-1)).toBe(53);
  });

  it('treats missing days and counts as zero', () => {
    expect(weeklyContributionTotals([{}, { contributionDays: null }, { contributionDays: [{ contributionCount: null }, { contributionCount: 4 }] }])).toEqual([0, 0, 4]);
  });

  it('returns null for an empty or missing calendar', () => {
    expect(weeklyContributionTotals([])).toBeNull();
    expect(weeklyContributionTotals(undefined)).toBeNull();
    expect(weeklyContributionTotals(null)).toBeNull();
  });
});
