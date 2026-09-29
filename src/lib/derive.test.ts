import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../data/schema.ts';
import { bestWeek, compact, contributionWeekStarts, formatInt, snapshotAge } from './derive.ts';

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
