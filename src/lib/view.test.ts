import { describe, expect, it } from 'vitest';
import snapshotJson from '../data/snapshot.json' with { type: 'json' };
import type { Snapshot } from '../data/schema.ts';
import { moreWork, work } from '../content/site.ts';
import { buildView, fill, MAX_PROOFS } from './view.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };

describe('fill', () => {
  it('fills placeholders', () => {
    expect(fill('{a} and {b}', { a: 1, b: 'two' })).toBe('1 and two');
  });
  it('returns null when a placeholder has no value, never leaking braces', () => {
    expect(fill('{a} and {b}', { a: 1 })).toBeNull();
    expect(fill('{a}', { a: '' })).toBeNull();
  });
});

describe.each(['en', 'pt'] as const)('buildView(%s) on the committed snapshot', (locale) => {
  const view = buildView(snapshot, locale, build);

  it('has all three hero notes, with no unfilled placeholders', () => {
    expect(view.hero.notes).toHaveLength(3);
    for (const note of view.hero.notes) expect(note.text).not.toMatch(/[{}]/);
  });

  it('keeps the page short: About, Work, Open source, Career, Contact', () => {
    expect(view.nav.map((n) => n.href)).toEqual(['#about', '#work', '#open-source', '#career', '#contact']);
  });

  it('features six projects, each with a note, a detail, a short stack and at most two proofs', () => {
    expect(view.work).toHaveLength(6);
    for (const entry of view.work) {
      expect(entry.name).toBeTruthy();
      expect(entry.note).toBeTruthy();
      expect(entry.detail).toBeTruthy();
      expect(entry.stack.length).toBeGreaterThan(0);
      expect(entry.stack.length).toBeLessThanOrEqual(4);
      expect(entry.proofs.length).toBeGreaterThan(0);
      expect(entry.proofs.length).toBeLessThanOrEqual(MAX_PROOFS);
      expect(entry.links.length).toBeGreaterThan(0);
    }
  });

  it('leads with stars, then downloads; never test, coverage or release-download counts', () => {
    const labels = view.work.flatMap((e) => e.proofs.map((p) => p.label));
    expect(labels.join(' ')).not.toMatch(/test|coverage|cobertura|README|release download|download de release/i);
    const mysql = view.work.find((e) => e.id === 'mysql-events')!;
    expect(mysql.proofs.map((p) => p.label)).toEqual([view.field.stars, view.field.downloadsYear]);
  });

  it('exposes About with both paragraphs and the two short lines', () => {
    expect(view.about.label).toBe(view.sections.about.label);
    expect(view.about.claim).toBeTruthy();
    expect(view.about.body).toBeTruthy();
    expect(view.about.stack.items.length).toBeGreaterThan(4);
    expect(view.about.aiTools.items).toContain('Claude Code');
  });

  it('lists smaller work as one line of linked names', () => {
    expect(view.moreWork.items.length).toBe(moreWork.items.length);
    for (const item of view.moreWork.items) {
      expect(item.href).toMatch(/^https:\/\/github\.com\/rodrigogs\//);
      expect(item.note).toBeTruthy();
    }
    const featured = new Set(view.work.map((e) => e.id));
    for (const item of view.moreWork.items) expect(featured.has(item.name)).toBe(false);
  });

  it('only shows public work: every entry and every smaller project resolves to a public repo', () => {
    const publicRepos = new Set(snapshot.repos.map((r) => r.name));
    for (const entry of work) expect(publicRepos.has(entry.repo)).toBe(true);
    for (const item of moreWork.items) expect(publicRepos.has(item.href.split('/').pop()!)).toBe(true);
  });

  it('never counts merged PRs for hermes-agent', () => {
    const agent = view.upstream.find((u) => u.repo === 'NousResearch/hermes-agent');
    expect(agent?.count).not.toMatch(/PR/);
  });

  it('never exposes excluded packages or repos', () => {
    const json = JSON.stringify(view);
    expect(json).not.toContain('@rodrigogs/serverless');
    expect(json).not.toContain('ilsap');
  });

  it('leaves no placeholder unfilled anywhere in the view', () => {
    const { jsonLd: _jsonLd, ...rest } = view;
    expect(JSON.stringify(rest)).not.toMatch(/\{[a-z]\w*\}/i);
  });
});

describe('contributionYear (README cards block)', () => {
  const withWeeks = (weeks: number[] | null): Snapshot => ({
    ...snapshot,
    fetchedAt: '2026-09-28T22:26:04Z',
    user: { ...snapshot.user, contributionWeeks: weeks },
  });

  it('is null when the snapshot has no weeks', () => {
    expect(buildView(withWeeks(null), 'en', build).contributionYear).toBeNull();
    expect(buildView(withWeeks(null), 'en', build).totals.contributionWeeks).toBeNull();
  });

  it('sums the weeks, dates them and names the best week', () => {
    const view = buildView(withWeeks([10, 250, 40]), 'en', build);
    expect(view.totals.contributionWeeks).toEqual([10, 250, 40]);
    expect(view.contributionYear).toMatchObject({
      weeks: [10, 250, 40],
      weekStarts: ['2026-09-13', '2026-09-20', '2026-09-27'],
      total: '300',
      totalRaw: 300,
      best: { index: 1, count: '250', countRaw: 250, weekOf: 'Sep 20, 2026' },
    });
  });

  it('counts releases across the public repos', () => {
    const view = buildView(snapshot, 'en', build);
    const releases = snapshot.repos.reduce((sum, r) => sum + r.releaseCount, 0);
    expect(view.totals.releases).toBe(new Intl.NumberFormat('en-US').format(releases));
  });
});
