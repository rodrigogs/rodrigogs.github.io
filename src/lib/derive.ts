/**
 * Pure, dependency-free helpers derived from `Snapshot`. Consumed by the
 * site pages and by the SVG card renderer (scripts/render-cards.ts), so
 * both draw the exact same conclusions from the exact same data.
 */

import type { Snapshot } from '../data/schema.ts';

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
