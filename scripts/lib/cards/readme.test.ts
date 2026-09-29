import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../src/data/schema.ts';
import snapshotJson from '../../../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../../../src/lib/view.ts';
import { methodTitle } from './method.ts';
import { aiProjectsLine, renderReadme, WORK_IDS } from './readme.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };
const view = buildView(snapshot, 'en', build);
const readme = renderReadme(view);
const section = (from: string, to: string) => readme.split(from)[1]!.split(to)[0]!.trim();

describe('renderReadme', () => {
  it('references every card the render step produces, each exactly once', () => {
    const files = ['header.svg', 'method.svg', 'hud.svg', 'skyline.svg', 'stack.svg', ...WORK_IDS.map((id) => `work-${id}.svg`)];
    for (const file of files) expect(readme.split(`https://rodrigogs.github.io/readme/${file}"`)).toHaveLength(2);
    expect(readme.match(/<img /g)).toHaveLength(files.length);
    expect(readme).not.toMatch(/-(light|dark)\.svg|upstream/);
  });

  it('keeps its sections in order, with the method first', () => {
    const order = ['## How I work with AI', '## Selected work', '## Stack'].map((h) => readme.indexOf(h));
    expect(order.every((i) => i > 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
    expect(readme.match(/^## /gm)).toHaveLength(3);
  });

  it('shows the method as a card and as a plain numbered list, one line per step', () => {
    const ai = section('## How I work with AI', '## Selected work');
    expect(ai).toContain(`alt="${methodTitle(view).replace(/"/g, '&quot;')}"`);
    view.aiWorkflow.items.forEach((step, i) => expect(ai).toContain(`\n${i + 1}. **${step.name}**: ${step.text}\n`));
    expect(ai).toContain(view.aiWorkflow.builtWith);
    expect(ai).toMatch(/<details><summary>The method as text<\/summary>\n\n1\. /);
  });

  it('keeps the proof sentence inside the collapsed text alternative, not repeated as its own visible paragraph', () => {
    const ai = section('## How I work with AI', '## Selected work');
    const collapsed = ai.split('<details>')[1]!;
    const visibleAfterCard = ai.split('method.svg')[1]!.split('<details>')[0]!;
    expect(collapsed).toContain(view.aiWorkflow.builtWith);
    expect(visibleAfterCard).not.toContain(view.aiWorkflow.builtWith);
    expect(readme).toContain(`Source: [rodrigogs/rodrigogs.github.io](${view.aiWorkflow.builtWithHref})`);
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

  it('reduces AI projects and collaborations to one line', () => {
    const line = aiProjectsLine(view);
    expect(line).not.toContain('\n');
    expect(line).toMatch(/^I also publish agent tooling \(.+\) and contribute to .+\.$/);
    for (const p of view.ai) expect(line).toContain(`[${p.name}](`);
    expect(line).toContain('[Hermes WebUI](');
    expect(readme.split('\n').filter((l) => l.includes('hermes-smart-router'))).toHaveLength(1);
  });

  it('opens with one first-person line and the links', () => {
    expect(readme).toContain(
      "I'm a Senior Software Engineer at Globant on the Disney Entertainment account, shipping software since 2010, remote from Rio Grande do Sul, Brazil.",
    );
    expect(readme).toContain('[Site](https://rodrigogs.github.io/) · [Em português](https://rodrigogs.github.io/pt/) · [LinkedIn](');
  });

  it('keeps the house style: no placeholders, no em dashes, no emoji', () => {
    expect(readme).not.toMatch(/[{}]/);
    expect(readme).not.toContain('—');
    expect(readme).not.toMatch(/\p{Extended_Pictographic}/u);
  });
});
