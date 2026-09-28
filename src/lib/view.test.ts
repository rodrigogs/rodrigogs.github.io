import { describe, expect, it } from 'vitest';
import snapshotJson from '../data/snapshot.json' with { type: 'json' };
import type { Snapshot } from '../data/schema.ts';
import { aiProjects, work } from '../content/site.ts';
import { buildView, fill, repoStatus } from './view.ts';

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

describe('repoStatus', () => {
  const base = snapshot.repos[0]!;
  it('maps last push age to active / maintained / dormant', () => {
    expect(repoStatus({ ...base, pushedAt: '2026-08-01T00:00:00Z' }, build.now)).toBe('latest');
    expect(repoStatus({ ...base, pushedAt: '2025-06-01T00:00:00Z' }, build.now)).toBe('maintained');
    expect(repoStatus({ ...base, pushedAt: '2019-01-01T00:00:00Z' }, build.now)).toBe('dormant');
  });
});

describe.each(['en', 'pt'] as const)('buildView(%s) on the committed snapshot', (locale) => {
  const view = buildView(snapshot, locale, build);

  it('has all three hero notes, with no unfilled placeholders', () => {
    expect(view.hero.notes).toHaveLength(3);
    for (const note of view.hero.notes) expect(note.text).not.toMatch(/[{}]/);
  });

  it('renders every curated work entry with its fixed furniture', () => {
    expect(view.work.length).toBeGreaterThanOrEqual(8);
    for (const entry of view.work) {
      expect(entry.name).toBeTruthy();
      expect(entry.note).toBeTruthy();
      expect(entry.statusLabel).toBeTruthy();
      expect(entry.born).toBeGreaterThan(2000);
      expect(entry.proofs.length).toBeGreaterThan(0);
    }
  });

  it('only shows public work: every entry resolves to a public repo or an upstream row', () => {
    const publicRepos = new Set(snapshot.repos.map((r) => r.name));
    const upstream = new Set(snapshot.upstream.map((u) => u.repo));
    for (const entry of work) expect(publicRepos.has(entry.repo)).toBe(true);
    for (const entry of aiProjects) {
      expect(entry.repo ? publicRepos.has(entry.repo) : upstream.has(entry.upstream ?? '')).toBe(true);
    }
  });

  it('never counts merged PRs for hermes-agent', () => {
    const agent = view.upstream.find((u) => u.repo === 'NousResearch/hermes-agent');
    expect(agent?.count).not.toMatch(/PR/);
  });

  it('never exposes excluded packages or repos', () => {
    expect(view.packages.some((p) => p.name === '@rodrigogs/serverless')).toBe(false);
    expect(JSON.stringify(view)).not.toContain('ilsap');
  });

  it('fills every section claim', () => {
    for (const s of Object.values(view.sections)) expect(s.claim).not.toMatch(/[{}]/);
  });

  it('offers a compare range with a non-empty diff', () => {
    const { data } = view.compare;
    expect(data.years.length).toBeGreaterThan(5);
    expect(data.initial.added.length + data.initial.removed.length).toBeGreaterThan(0);
  });
});
