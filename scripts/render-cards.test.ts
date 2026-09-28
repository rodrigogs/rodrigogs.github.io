import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../src/data/schema.ts';
import snapshotJson from '../src/data/snapshot.json' with { type: 'json' };
import { themes } from '../src/design/tokens.ts';
import { buildView } from '../src/lib/view.ts';
import type { VNode } from './lib/cards/h.ts';
import { headerCard, HEADER_HEIGHT, HEADER_WIDTH } from './lib/cards/header.ts';
import { workCard, WORK_HEIGHT, WORK_WIDTH } from './lib/cards/work.ts';
import { withAccessibleTitle } from './lib/cards/svg.ts';
import { renderSvg } from './render-cards.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };
const view = buildView(snapshot, 'en', build);

/** Collects every vnode in the tree whose style matches `pred`. */
function collectByStyle(node: unknown, pred: (style: Record<string, unknown>) => boolean, out: VNode[] = []): VNode[] {
  if (Array.isArray(node)) {
    for (const child of node) collectByStyle(child, pred, out);
    return out;
  }
  if (node && typeof node === 'object' && 'props' in node) {
    const v = node as VNode;
    const style = (v.props as { style?: Record<string, unknown> }).style;
    if (style && pred(style)) out.push(v);
    collectByStyle((v.props as { children?: unknown }).children, pred, out);
  }
  return out;
}

describe('headerCard', () => {
  it('gives every hero-note role plate the same fixed column width', async () => {
    const node = await headerCard(view, themes.light);
    const plates = collectByStyle(node, (s) => s.boxSizing === 'border-box');
    expect(plates).toHaveLength(view.hero.notes.length);
    const widths = plates.map((p) => (p.props as { style: { width: number } }).style.width);
    expect(new Set(widths).size).toBe(1);
    expect(widths[0]).toBeGreaterThan(0);
  });
});

describe('withAccessibleTitle', () => {
  it('adds a role, aria-label and <title> without touching the rest of the markup', () => {
    const svg = withAccessibleTitle('<svg width="10" height="10"><rect/></svg>', 'A "quoted" name & more');
    expect(svg).toMatch(/^<svg role="img" aria-label="A &quot;quoted&quot; name &amp; more"/);
    expect(svg).toContain('<title>A &quot;quoted&quot; name &amp; more</title>');
    expect(svg).toContain('<rect/>');
  });
});

describe.each(['light', 'dark'] as const)('renderSvg(%s)', (themeName) => {
  const theme = themes[themeName];

  it('renders the header at 1280x400 with an accessible title', async () => {
    const svg = await renderSvg(await headerCard(view, theme), { width: HEADER_WIDTH, height: HEADER_HEIGHT }, `${view.person.name}. ${view.hero.title}`);
    expect(svg).toMatch(/^<svg role="img" aria-label="Rodrigo Gomes da Silva\./);
    expect(svg).toContain('<title>Rodrigo Gomes da Silva.');
    expect(svg).toMatch(/<svg[^>]*\swidth="1280"[^>]*\sheight="400"/);
  });

  it('renders a work card at 840x300 with an accessible title', async () => {
    const entry = view.work.find((w) => w.id === 'whats-reader');
    expect(entry).toBeTruthy();
    const svg = await renderSvg(workCard(entry!, view.field, theme), { width: WORK_WIDTH, height: WORK_HEIGHT }, `${entry!.name}: ${entry!.note}`);
    expect(svg).toMatch(/^<svg role="img" aria-label="whats-reader:/);
    expect(svg).toContain('<title>whats-reader:');
    expect(svg).toMatch(/<svg[^>]*\swidth="840"[^>]*\sheight="300"/);
  });
});
