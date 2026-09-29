import { describe, expect, it } from 'vitest';
import type { Snapshot } from '../../../src/data/schema.ts';
import snapshotJson from '../../../src/data/snapshot.json' with { type: 'json' };
import { buildView } from '../../../src/lib/view.ts';
import { stack, aiWorkflow } from '../../../src/content/site.ts';
import { subsetFont } from './fontembed.ts';
import { faceData, FACES } from './fonts.ts';
import { hudStats } from './hud.ts';
import { axisFor, buildingHeight, skylineCard, skylineTitle } from './skyline.ts';
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
});

describe('stack marks', () => {
  const said = [
    ...stack.ships.items,
    ...stack.groups.flatMap((g) => g.items.map((i) => (typeof i === 'string' ? i : i.en))),
    ...aiWorkflow.items.flatMap((i) => i.tools),
  ].join(' | ');

  it('only draws technologies the stack or the method names', () => {
    for (const m of [...SHIP_MARKS, ...TOOL_MARKS]) expect(said, m.label).toContain(m.label);
  });

  it('draws about eighteen real simple-icons marks', () => {
    const marks = [...SHIP_MARKS, ...TOOL_MARKS];
    expect(marks.length).toBeGreaterThanOrEqual(16);
    for (const m of marks) expect(m.icon.path).toMatch(/^[Mm]/);
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
