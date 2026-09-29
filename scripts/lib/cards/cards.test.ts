import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../src/data/schema.ts';
import snapshotJson from '../../../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../../../src/lib/view.ts';
import { about } from '../../../src/content/site.ts';
import { subsetFont } from './fontembed.ts';
import { faceData, FACES } from './fonts.ts';
import { hudStats } from './hud.ts';
import { axisFor, buildingHeight, niceCeiling, ordinaryAxis, skylineCard, skylineTitle } from './skyline.ts';
import { SHIP_MARKS, TOOL_MARKS } from './stack.ts';
import { workProofs } from './work.ts';

const snapshot = snapshotJson as unknown as Snapshot;
const build = { now: new Date('2026-09-28T12:00:00Z'), sha: '' };
const view = buildView(snapshot, 'en', build);

describe('skyline scale', () => {
  it('is linear from zero', () => {
    const top = axisFor(1294).top;
    expect(buildingHeight(0, top)).toBe(0);
    expect(buildingHeight(600, top)).toBeCloseTo(2 * buildingHeight(300, top));
    expect(buildingHeight(top, top)).toBeGreaterThan(buildingHeight(1294, top));
  });

  it('picks a round axis top with at most three gridlines', () => {
    expect(axisFor(1294)).toEqual({ top: 1500, step: 500 });
    expect(axisFor(40)).toEqual({ top: 40, step: 20 });
    expect(axisFor(41)).toEqual({ top: 60, step: 20 });
    expect(axisFor(1).top).toBeGreaterThanOrEqual(1);
  });

  it('falls back to a note when there is no contribution data', async () => {
    const svg = await skylineCard({ ...view, contributionYear: null });
    expect(svg).toContain('Contribution data was unavailable on the last build.');
    expect(skylineTitle(null)).toMatch(/unavailable/);
  });

  it('rounds the ordinary-weeks ceiling up to a clean 1/2/5 number', () => {
    expect(niceCeiling(414)).toBe(500);
    expect(niceCeiling(77)).toBe(100);
    expect(niceCeiling(930)).toBe(1000);
    expect(ordinaryAxis(414)).toEqual({ top: 500, step: 250 });
  });

  it('draws the record week off the ordinary scale, capped at the chart top, never past it', async () => {
    const svg = await skylineCard(view);
    // The record week (1,294) dwarfs the rest of this snapshot's weeks: it is
    // capped at the chart top with a break mark (a light chevron stroked in ink),
    // never drawn by the old unbounded leader, and not called out in words.
    expect(svg).toMatch(/stroke="#FFF6FB" stroke-width="2" stroke-linecap="round"/);
    expect(svg).not.toContain('V58"');
    expect(svg).not.toContain('Tallest tower');
    expect(svg).not.toContain('Best week');
  });
});

describe('stack marks', () => {
  const named = [...about.stack.items, ...about.aiTools.items];

  it('only draws marks for technologies and tools the About lines name', () => {
    for (const m of [...SHIP_MARKS, ...TOOL_MARKS]) expect(named, m.label).toContain(m.label);
  });

  it('draws a real simple-icons mark for every named item that has one', () => {
    const marks = [...SHIP_MARKS, ...TOOL_MARKS];
    expect(marks.length).toBeGreaterThanOrEqual(12);
    for (const m of marks) expect(m.icon.path).toMatch(/^[Mm]/);
  });

  it('never invents a mark for the items that have none in simple-icons', () => {
    const marked = new Set([...SHIP_MARKS, ...TOOL_MARKS].map((m) => m.label));
    expect(named.filter((label) => !marked.has(label))).toEqual(['AWS', 'Playwright MCP', 'Context7']);
  });
});

describe('hudStats', () => {
  it('drops the contributions readout when the calendar is unavailable', () => {
    expect(hudStats(view).map((s) => s.icon)).toContain('calendar');
    const noCalendar = { ...view, totals: { ...view.totals, contributions: null } };
    expect(hudStats(noCalendar).map((s) => s.icon)).not.toContain('calendar');
  });
});

describe('workProofs', () => {
  it('keeps at most two proofs that fit one line', () => {
    for (const entry of view.work) {
      const proofs = workProofs(entry);
      expect(proofs.length).toBeGreaterThan(0);
      expect(proofs.length).toBeLessThanOrEqual(2);
    }
  });
});

describe('subsetFont', () => {
  it('keeps a face small when only a few characters are needed', async () => {
    const inter = FACES.find((f) => f.family === 'Inter' && f.weight === 400)!;
    const out = await subsetFont(faceData(inter), 'Hello');
    expect(out.byteLength).toBeGreaterThan(500);
    expect(out.byteLength).toBeLessThan(faceData(inter).byteLength / 10);
  });
});
