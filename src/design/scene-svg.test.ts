import { describe, expect, it } from 'vitest';
import { sceneGeometry, sceneGridSvg, sceneSilhouettesSvg, sceneSvg } from './scene-svg.ts';
import { scene } from './tokens.ts';

const poster = { width: 1600, height: 900 };
const bytes = (s: string) => new TextEncoder().encode(s).length;

describe('sceneSvg', () => {
  it('is deterministic', () => {
    expect(sceneSvg(poster)).toBe(sceneSvg(poster));
    expect(sceneSvg({ ...poster, animated: true, idPrefix: 'a-' })).toBe(sceneSvg({ ...poster, animated: true, idPrefix: 'a-' }));
  });

  it('is a complete svg with the requested size', () => {
    const svg = sceneSvg({ width: 1200, height: 630 });
    expect(svg.startsWith('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 630" width="1200" height="630"')).toBe(true);
    expect(svg.endsWith('</svg>')).toBe(true);
  });

  it('stays inside the size budgets', () => {
    expect(bytes(sceneSvg(poster))).toBeLessThan(12 * 1024);
    expect(bytes(sceneSvg({ ...poster, animated: true, grid: true }))).toBeLessThan(60 * 1024);
  });

  it('references nothing outside itself and carries no text', () => {
    for (const svg of [sceneSvg(poster), sceneSvg({ ...poster, animated: true, grid: true }), sceneSilhouettesSvg(poster), sceneGridSvg(poster)]) {
      expect(svg).not.toMatch(/https?:\/\/(?!www\.w3\.org\/2000\/svg")/);
      expect(svg).not.toMatch(/<(text|foreignObject|image|script|filter)\b/);
      expect(svg).not.toMatch(/href="(?!#)/);
    }
  });

  it('prefixes every id and every internal reference', () => {
    const svg = sceneSvg({ ...poster, animated: true, grid: true, idPrefix: 'hero-' });
    const ids = [...svg.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]!);
    expect(ids.length).toBeGreaterThan(5);
    for (const id of ids) expect(id.startsWith('hero-')).toBe(true);
    for (const [, ref] of svg.matchAll(/url\(#([^)]+)\)|href="#([^"]+)"/g)) {
      if (ref) expect(ids).toContain(ref);
    }
    for (const [, cls] of svg.matchAll(/\bclass="([^"]+)"/g)) expect(cls!.startsWith('hero-')).toBe(true);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('only animates when asked', () => {
    expect(sceneSvg(poster)).not.toMatch(/<animate/);
    expect(sceneSvg({ ...poster, animated: true })).toMatch(/<animate/);
  });

  it('draws the optional layers only when enabled', () => {
    const bare = sceneSvg({ ...poster, palms: false, skyline: false });
    expect(bare).not.toContain('palm');
    expect(bare).not.toContain('skyline');
    expect(bare).not.toContain(scene.neonCyan);
    expect(sceneSvg(poster)).not.toContain('floor');
    expect(sceneSvg({ ...poster, grid: true })).toContain('floor');
  });

  it('uses palette colors only', () => {
    const svg = sceneSvg({ ...poster, grid: true });
    const colors = new Set([...svg.matchAll(/#[0-9A-Fa-f]{3,6}\b/g)].map((m) => m[0].toUpperCase()));
    // Mask channels are black and white by definition.
    colors.delete('#FFF');
    colors.delete('#000');
    const allowed = new Set([...Object.values(scene).filter((v) => typeof v === 'string'), '#FFF6FB'].map((v) => String(v).toUpperCase()));
    for (const c of colors) expect(allowed).toContain(c);
  });
});

describe('sceneGeometry', () => {
  it('puts the horizon on the token fraction and the sun at sunX', () => {
    const g = sceneGeometry(1600, 900);
    expect(g.horizon).toBeCloseTo(900 * scene.horizonAt, 0);
    expect(g.sun.cx).toBeCloseTo(1600 * 0.68, 0);
    expect(sceneGeometry(1600, 900, 0.5).sun.cx).toBe(800);
    // The sun sits on the horizon: its lower part is under the water line.
    expect(g.sun.cy + g.sun.r).toBeGreaterThan(g.horizon);
    expect(g.sun.cy - g.sun.r).toBeLessThan(g.horizon);
  });
});
