import { describe, expect, it } from 'vitest';
import type { PackageStat, RepoStat, Snapshot } from '../data/schema.ts';
import { activeYears, bestWeek, compact, contributionWeekStarts, diffStacks, diffWork, formatInt, snapshotAge, stackByYear, techOfRepo } from './derive.ts';

function repo(overrides: Partial<RepoStat> = {}): RepoStat {
  return {
    name: 'sample',
    fullName: 'rodrigogs/sample',
    url: 'https://github.com/rodrigogs/sample',
    description: null,
    homepage: null,
    stars: 0,
    forks: 0,
    language: 'TypeScript',
    languages: { TypeScript: 100_000 },
    topics: [],
    frameworks: [],
    createdAt: '2020-01-01T00:00:00Z',
    pushedAt: '2020-06-01T00:00:00Z',
    archived: false,
    fork: false,
    license: null,
    latestRelease: null,
    releaseCount: 0,
    releaseDownloads: 0,
    ...overrides,
  };
}

function pkg(overrides: Partial<PackageStat> = {}): PackageStat {
  return {
    registry: 'npm',
    name: '@rodrigogs/sample',
    url: 'https://www.npmjs.com/package/@rodrigogs/sample',
    repo: 'sample',
    description: null,
    version: '1.0.0',
    monthlyDownloads: 0,
    yearlyDownloads: null,
    totalDownloads: null,
    excluded: false,
    ...overrides,
  };
}

describe('techOfRepo', () => {
  it('keeps languages at or above the 10% share threshold', () => {
    const r = repo({ languages: { TypeScript: 90_000, JavaScript: 10_000 } });
    expect(techOfRepo(r)).toEqual(['JavaScript', 'TypeScript']);
  });

  it('drops languages below both the share threshold and the byte floor', () => {
    const r = repo({ languages: { TypeScript: 995_000, JavaScript: 5_000 } });
    expect(techOfRepo(r)).toEqual(['TypeScript']);
  });

  it('keeps a language below 10% share when it clears the 20,000 byte floor', () => {
    const r = repo({ languages: { TypeScript: 500_000, Python: 20_000 } });
    expect(techOfRepo(r)).toEqual(['Python', 'TypeScript']);
  });

  it('excludes markup/tooling noise languages regardless of size', () => {
    const r = repo({ languages: { TypeScript: 50_000, HTML: 40_000, Dockerfile: 1_000 } });
    expect(techOfRepo(r)).toEqual(['TypeScript']);
  });

  it('merges in frameworks, deduplicated and sorted', () => {
    const r = repo({
      languages: { TypeScript: 100_000 },
      frameworks: ['React', 'TypeScript'],
    });
    expect(techOfRepo(r)).toEqual(['React', 'TypeScript']);
  });
});

describe('activeYears', () => {
  it('spans created through min(pushed, created+2) for a short-lived repo', () => {
    const r = repo({ createdAt: '2018-03-01T00:00:00Z', pushedAt: '2018-11-01T00:00:00Z' });
    expect(activeYears(r)).toEqual([2018]);
  });

  it('caps at created+2 for a repo pushed long after', () => {
    const r = repo({ createdAt: '2015-01-01T00:00:00Z', pushedAt: '2023-01-01T00:00:00Z' });
    expect(activeYears(r)).toEqual([2015, 2016, 2017, 2023]);
  });

  it('is a single year when created and pushed fall in the same year', () => {
    const r = repo({ createdAt: '2022-05-01T00:00:00Z', pushedAt: '2022-05-02T00:00:00Z' });
    expect(activeYears(r)).toEqual([2022]);
  });
});

describe('stackByYear', () => {
  it('unions tech across repos active in a year', () => {
    const repos = [
      repo({ name: 'a', createdAt: '2020-01-01T00:00:00Z', pushedAt: '2020-06-01T00:00:00Z', languages: { Go: 100_000 } }),
      repo({ name: 'b', createdAt: '2019-01-01T00:00:00Z', pushedAt: '2021-01-01T00:00:00Z', languages: { Rust: 100_000 } }),
    ];
    const result = stackByYear(repos, [], { minYear: 2019, maxYear: 2021 });
    expect(result[2019]).toEqual(['Rust']);
    expect(result[2020]).toEqual(['Go', 'Rust']);
    expect(result[2021]).toEqual(['Rust']);
  });

  it('counts current-manifest frameworks only in the last-push year', () => {
    const repos = [
      repo({
        name: 'old-but-alive',
        createdAt: '2018-01-01T00:00:00Z',
        pushedAt: '2026-03-01T00:00:00Z',
        languages: { TypeScript: 100_000 },
        frameworks: ['Biome'],
      }),
    ];
    const result = stackByYear(repos, [], { minYear: 2018, maxYear: 2026 });
    expect(result[2018]).toEqual(['TypeScript']);
    expect(result[2026]).toEqual(['Biome', 'TypeScript']);
  });

  it('filters build-config and shader noise languages', () => {
    const r = repo({ languages: { ApacheConf: 90_000, ShaderLab: 50_000, 'C#': 200_000 } });
    expect(techOfRepo(r)).toEqual(['C#']);
  });

  it('layers in curated extra ranges', () => {
    const repos = [repo({ languages: { Go: 100_000 }, createdAt: '2020-01-01T00:00:00Z', pushedAt: '2020-01-01T00:00:00Z' })];
    const extra = [{ from: 2011, to: 2015, stack: ['Java', 'Grails'] }];
    const result = stackByYear(repos, extra, { minYear: 2011, maxYear: 2020 });
    expect(result[2012]).toEqual(['Grails', 'Java']);
    expect(result[2020]).toEqual(['Go']);
  });

  it('defaults the range to earliest observed year through the current year', () => {
    const repos = [repo({ createdAt: '2017-01-01T00:00:00Z', pushedAt: '2017-01-01T00:00:00Z', languages: { Go: 100_000 } })];
    const result = stackByYear(repos, []);
    const years = Object.keys(result).map(Number);
    expect(Math.min(...years)).toBe(2017);
    expect(Math.max(...years)).toBe(new Date().getUTCFullYear());
  });
});

describe('diffStacks', () => {
  it('reports added, removed and kept, sorted', () => {
    const result = diffStacks(['Java', 'MySQL', 'jQuery'], ['Java', 'TypeScript', 'React']);
    expect(result).toEqual({
      added: ['React', 'TypeScript'],
      removed: ['MySQL', 'jQuery'],
      kept: ['Java'],
    });
  });
});

describe('diffWork', () => {
  it('counts repos created in range', () => {
    const repos = [
      repo({ name: 'a', createdAt: '2020-05-01T00:00:00Z' }),
      repo({ name: 'b', createdAt: '2022-05-01T00:00:00Z' }),
    ];
    expect(diffWork(repos, [], 2020, 2021).reposCreated).toBe(1);
  });

  it('counts a repo with a release published in range even if created earlier', () => {
    const repos = [
      repo({
        name: 'a',
        createdAt: '2015-01-01T00:00:00Z',
        releaseCount: 3,
        latestRelease: { tag: 'v2.0.0', name: null, publishedAt: '2021-06-01T00:00:00Z', url: 'https://x' },
      }),
    ];
    expect(diffWork(repos, [], 2020, 2021).releases).toBe(1);
  });

  it('falls back to createdAt for release activity when a repo has no releases', () => {
    const repos = [repo({ name: 'a', createdAt: '2021-03-01T00:00:00Z', releaseCount: 0, latestRelease: null })];
    expect(diffWork(repos, [], 2020, 2021).releases).toBe(1);
  });

  it('does not count a no-release repo created outside range', () => {
    const repos = [repo({ name: 'a', createdAt: '2010-03-01T00:00:00Z', releaseCount: 0, latestRelease: null })];
    expect(diffWork(repos, [], 2020, 2021).releases).toBe(0);
  });

  it('counts non-excluded packages whose linked repo was created in range', () => {
    const repos = [repo({ name: 'a', createdAt: '2020-05-01T00:00:00Z' })];
    const packages = [pkg({ repo: 'a', excluded: false }), pkg({ name: '@rodrigogs/excluded', repo: 'a', excluded: true })];
    expect(diffWork(repos, packages, 2020, 2021).packagesPublished).toBe(1);
  });
});

describe('compact', () => {
  it('formats compactly in en', () => {
    expect(compact(1200, 'en')).toBe('1.2K');
  });

  it('formats compactly in pt', () => {
    // pt-BR's Intl output uses a non-breaking space (U+00A0) before the unit.
    expect(compact(1200, 'pt')).toBe('1,2 mil');
  });
});

describe('formatInt', () => {
  it('adds thousands separators per locale', () => {
    expect(formatInt(1234, 'en')).toBe('1,234');
    expect(formatInt(1234, 'pt')).toBe('1.234');
  });
});

describe('snapshotAge', () => {
  function snapshot(fetchedAt: string): Snapshot {
    return {
      schemaVersion: 1,
      fetchedAt,
      sources: {
        github: { ok: true, lastSuccessAt: fetchedAt },
        npm: { ok: true, lastSuccessAt: fetchedAt },
        crates: { ok: true, lastSuccessAt: fetchedAt },
      },
      user: {
        login: 'rodrigogs',
        name: 'Rodrigo',
        followers: 0,
        publicRepos: 0,
        createdAt: fetchedAt,
        contributionsLastYear: null,
        contributionWeeks: null,
      },
      repos: [],
      packages: [],
      upstream: [],
      totals: { stars: 0, repos: 0, monthlyDownloads: 0, packages: 0, releaseDownloads: 0 },
    };
  }

  it('is not stale within 3 days', () => {
    const now = new Date('2026-09-28T00:00:00Z');
    const { days, stale } = snapshotAge(snapshot('2026-09-26T00:00:00Z'), now);
    expect(days).toBe(2);
    expect(stale).toBe(false);
  });

  it('is stale past 3 days', () => {
    const now = new Date('2026-09-28T00:00:00Z');
    const { days, stale } = snapshotAge(snapshot('2026-09-20T00:00:00Z'), now);
    expect(days).toBe(8);
    expect(stale).toBe(true);
  });
});

describe('contributionWeekStarts', () => {
  it('ends on the Sunday of the fetch week and steps back one week at a time', () => {
    // 2026-09-28 is a Monday.
    expect(contributionWeekStarts('2026-09-28T22:26:04Z', 3)).toEqual(['2026-09-13', '2026-09-20', '2026-09-27']);
  });

  it('keeps a Sunday fetch in its own week', () => {
    expect(contributionWeekStarts('2026-09-27T01:00:00Z', 1)).toEqual(['2026-09-27']);
  });
});

describe('bestWeek', () => {
  it('returns the busiest week, the earliest on a tie', () => {
    expect(bestWeek([3, 9, 2, 9])).toEqual({ index: 1, count: 9 });
  });

  it('returns null for no activity', () => {
    expect(bestWeek([])).toBeNull();
    expect(bestWeek([0, 0])).toBeNull();
  });
});
