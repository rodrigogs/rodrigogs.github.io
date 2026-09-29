import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../src/data/schema.ts';
import snapshotJson from '../../../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../../../src/lib/view.ts';
import { alsoLine, renderReadme, upstreamLine, WORK_IDS } from './readme.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };
const view = buildView(snapshot, 'en', build);
const readme = renderReadme(view);
const section = (from: string, to: string) => readme.split(from)[1]!.split(to)[0]!.trim();

describe('renderReadme', () => {
  it('references every card the render step produces, each exactly once', () => {
    const files = ['header.svg', 'hud.svg', 'skyline.svg', 'stack.svg', ...WORK_IDS.map((id) => `work-${id}.svg`)];
    for (const file of files) expect(readme.split(`https://rodrigogs.github.io/readme/${file}"`)).toHaveLength(2);
    expect(readme.match(/<img /g)).toHaveLength(files.length);
    expect(readme).not.toMatch(/-(light|dark)\.svg|upstream\.svg|method\.svg/);
  });

  it('opens with the About paragraphs, then keeps its two sections in order', () => {
    const top = readme.split('## Selected work')[0]!;
    expect(top).toContain(`\n${view.about.claim}\n`);
    expect(top).toContain(`\n${view.about.body}\n`);
    const order = ['## Selected work', '## Stack'].map((h) => readme.indexOf(h));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(readme.match(/^## /gm)).toHaveLength(2);
  });

  it('has no numbered method, no manifesto and no self-referential build claims', () => {
    expect(readme).not.toMatch(/^\d+\. /m);
    expect(readme).not.toMatch(/How I work with AI|The method|built this way/i);
  });

  it('puts each pair of work cards on one source line, one pair per row', () => {
    const lines = section('## Selected work', '## Stack').split('\n').filter((l) => l.startsWith('<a '));
    expect(lines).toHaveLength(WORK_IDS.length / 2);
    for (const line of lines) expect(line.match(/<a href=/g)).toHaveLength(2);
  });

  it('gives every work card an alt text of "name: note"', () => {
    for (const id of WORK_IDS) {
      const entry = view.work.find((w) => w.id === id)!;
      expect(readme).toContain(`alt="${entry.name}: ${entry.note}"`);
    }
  });

  it('puts smaller work and upstream work on one line each', () => {
    for (const line of [alsoLine(view), upstreamLine(view)]) {
      expect(line).not.toContain('\n');
      expect(readme).toContain(`\n${line}\n`);
    }
    for (const m of view.moreWork.items) expect(alsoLine(view)).toContain(`[${m.name}](${m.href})`);
    for (const u of view.upstream) expect(upstreamLine(view)).toContain(`](${u.proofUrl})`);
    expect(readme.split('\n').filter((l) => l.includes('hermes-smart-router'))).toHaveLength(1);
  });

  it('says where I work from, then the links', () => {
    expect(readme).toContain(
      'Remote from Rio Grande do Sul, Brazil (UTC−3) · [Site](https://rodrigogs.github.io/) · [Em português](https://rodrigogs.github.io/pt/) · [LinkedIn](',
    );
  });

  it('keeps the house style: no placeholders, no em dashes, no emoji', () => {
    expect(readme).not.toMatch(/[{}]/);
    expect(readme).not.toContain('—');
    expect(readme).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
