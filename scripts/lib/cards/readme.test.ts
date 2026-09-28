import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../src/data/schema.ts';
import snapshotJson from '../../../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../../../src/lib/view.ts';
import { renderReadme, WORK_IDS } from './readme.ts';
import { upstreamTitle } from './upstream.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };
const view = buildView(snapshot, 'en', build);
const readme = renderReadme(view);

describe('renderReadme', () => {
  it('references every card image the render step produces, each exactly once', () => {
    const urls = [
      'https://rodrigogs.github.io/readme/header-dark.svg',
      'https://rodrigogs.github.io/readme/header-light.svg',
      'https://rodrigogs.github.io/readme/upstream-dark.svg',
      'https://rodrigogs.github.io/readme/upstream-light.svg',
      ...WORK_IDS.flatMap((id) => [
        `https://rodrigogs.github.io/readme/work-${id}-dark.svg`,
        `https://rodrigogs.github.io/readme/work-${id}-light.svg`,
      ]),
    ];
    for (const url of urls) expect(readme).toContain(url);
    expect(new Set(urls).size).toBe(urls.length);
  });

  it('puts each pair of release cards on one source line, one pair per row', () => {
    const releases = readme.split('## Releases')[1]!.split('Also live:')[0]!.trim();
    const lines = releases.split('\n').filter(Boolean);
    expect(lines).toHaveLength(WORK_IDS.length / 2);
    for (const line of lines) {
      expect(line.match(/<a href=/g)).toHaveLength(2);
    }
  });

  it('gives every release card an alt text of "name: note"', () => {
    for (const id of WORK_IDS) {
      const entry = view.work.find((w) => w.id === id);
      expect(entry).toBeTruthy();
      expect(readme).toContain(`alt="${entry!.name}: ${entry!.note}"`);
    }
  });

  it('uses the exact upstream card title as the upstream embed alt text', () => {
    expect(readme).toContain(`alt="${upstreamTitle(view.upstream)}"`);
  });

  it('never leaves a template placeholder unresolved', () => {
    expect(readme).not.toContain('{');
  });
});
