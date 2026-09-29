import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../src/data/schema.ts';
import snapshotJson from '../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../src/lib/view.ts';
import { readPngText, PROVENANCE_KEY } from './lib/cards/png.ts';
import { WORK_IDS } from './lib/cards/readme.ts';
import { BUDGET, renderOgPng, renderReadmeCards } from './render-cards.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: 'abcdef1234567' };
const view = buildView(snapshot, 'en', build);
const cards = new Map(await renderReadmeCards(view));

const dims = (svg: string) => {
  const m = /^<svg[^>]*\swidth="(\d+)"[^>]*\sheight="(\d+)"/.exec(svg);
  return m ? { width: Number(m[1]), height: Number(m[2]) } : null;
};

describe('renderReadmeCards', () => {
  it('renders one night card per README image, and nothing else', () => {
    expect([...cards.keys()]).toEqual(['header.svg', 'hud.svg', 'skyline.svg', 'stack.svg', ...WORK_IDS.map((id) => `work-${id}.svg`)]);
  });

  it('gives every card its size', () => {
    expect(dims(cards.get('header.svg')!)).toEqual({ width: 1280, height: 420 });
    expect(dims(cards.get('hud.svg')!)).toEqual({ width: 1280, height: 220 });
    expect(dims(cards.get('skyline.svg')!)).toEqual({ width: 1280, height: 300 });
    expect(dims(cards.get('stack.svg')!)).toEqual({ width: 1280, height: 360 });
    for (const id of WORK_IDS) expect(dims(cards.get(`work-${id}.svg`)!)).toEqual({ width: 840, height: 300 });
  });

  it.each([...cards.keys()])('%s is accessible, self-contained and inside its budget', (name) => {
    const svg = cards.get(name)!;
    expect(svg).toMatch(/^<svg xmlns="http:\/\/www\.w3\.org\/2000\/svg"[^>]* role="img" aria-label="[^"]{10,}"/);
    expect(svg).toMatch(/<title>[^<]{10,}<\/title>/);
    // Nothing fetched from outside: GitHub's <img> sandbox would drop it.
    expect(svg.replace(/xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, '')).not.toMatch(/https?:\/\//);
    expect(svg).not.toMatch(/<(foreignObject|image|script)\b/);
    expect(svg).not.toMatch(/href="(?!#)/);
    const ids = [...svg.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
    expect(new Set(ids).size).toBe(ids.length);
    for (const ref of svg.matchAll(/url\(#([^)]+)\)/g)) expect(ids).toContain(ref[1]);
    expect(Buffer.byteLength(svg)).toBeLessThan(name === 'header.svg' ? BUDGET.header : BUDGET.card);
  });

  it('embeds a subset font for every face its text uses', () => {
    for (const [name, svg] of cards) {
      const families = new Set([...svg.matchAll(/font-family="([^"]+)"/g)].map((m) => m[1]));
      for (const family of families) expect(svg, `${name}: ${family}`).toContain(`@font-face{font-family:'${family}'`);
    }
  });

  it('animates the header and keeps the rest of its text off the sun', () => {
    expect(cards.get('header.svg')).toMatch(/<animate\b/);
  });

  it('draws both About lines on the stack card', () => {
    const svg = cards.get('stack.svg')!;
    for (const item of [...view.about.stack.items, ...view.about.aiTools.items]) expect(svg).toContain(item);
  });

  it('prints the real HUD numbers', () => {
    const svg = cards.get('hud.svg')!;
    for (const value of [view.totals.stars, view.totals.monthlyDownloads, view.totals.followers, view.totals.releases]) expect(svg).toContain(`>${value}<`);
  });
});

describe('renderOgPng', () => {
  it('renders a PNG with its provenance chunk', async () => {
    const png = await renderOgPng(view);
    expect(png.subarray(1, 4).toString('latin1')).toBe('PNG');
    expect(png.readUInt32BE(16)).toBe(1200);
    expect(png.readUInt32BE(20)).toBe(630);
    expect(readPngText(png)[PROVENANCE_KEY]).toMatch(/^origin: rendered at build time/);
  });
});
