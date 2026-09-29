/**
 * The 1986 night-drive scene as SVG, pure and dependency-free (colors come
 * from `scene` and `vaporwave` in tokens.ts, nothing else).
 *
 * Back to front: the sky gradient, deterministic stars, a halo, the sliced
 * sun, the horizon glow, the ocean with reflection bars under the sun, an
 * optional vaporwave perspective grid over the water, the Art Deco skyline
 * with neon edges and palm silhouettes at both sides. Every shape is our own.
 *
 * Consumers:
 *   - the site hero: `sceneSvg` (backdrop poster, first paint and fallback),
 *     `sceneSilhouettesSvg` (skyline and palms over the live canvas) and
 *     `sceneGridSvg` (the cheat-code grid when the canvas is not running);
 *   - the WebGL hero shader reads `sceneGeometry` so it lines up with the SVG;
 *   - the README renderer (scripts/render-cards.ts) embeds `sceneSvg` with
 *     `animated: true` (SMIL, so it runs inside a GitHub <img>).
 *
 * No text, no external references, no <foreignObject>, no filters.
 */

import { scene, themes, vaporwave } from './tokens.ts';

export interface SceneSvgOptions {
  width: number;
  height: number;
  /** SMIL animation for a README <img>: drifting sun slices, shimmering water, twinkling stars, flickering neon. */
  animated?: boolean;
  /** Prefix for every id and class, so several scenes can share a document. */
  idPrefix?: string;
  palms?: boolean;
  skyline?: boolean;
  /** The vaporwave perspective grid over the ocean. */
  grid?: boolean;
  /** Sun center as a fraction of the width, 0..1. Default 0.68. */
  sunX?: number;
}

/** Geometry shared by the SVG layers and the hero shader, in user units. */
export interface SceneGeometry {
  width: number;
  height: number;
  /** Height unit: every size is designed on a 900-unit-tall scene. */
  u: number;
  horizon: number;
  sun: { cx: number; cy: number; r: number };
  /** Sun slices: a gap where fract(bands * s - phase) < gap * s, s in 0..1 from `top` to `bottom`. */
  slices: { top: number; bottom: number; bands: number; gap: number };
}

export const SUN_X = 0.68;

export function sceneGeometry(width: number, height: number, sunX = SUN_X): SceneGeometry {
  const u = height / 900;
  const horizon = r1(height * scene.horizonAt);
  const r = 170 * u;
  const cy = horizon - 120 * u;
  return {
    width,
    height,
    u,
    horizon,
    sun: { cx: r1(width * clamp(sunX, 0, 1)), cy: r1(cy), r: r1(r) },
    slices: { top: r1(cy - 0.2 * r), bottom: r1(cy + r), bands: 8, gap: 0.85 },
  };
}

// ---------------------------------------------------------------------------
// Numbers and randomness
// ---------------------------------------------------------------------------

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
/** One decimal, no trailing zeros: keeps the markup small and deterministic. */
const r1 = (v: number) => Math.round(v * 10) / 10;
const n = (v: number) => String(r1(v));

/** mulberry32: a tiny seeded PRNG, so the stars are the same on every build. */
function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const SEED = 1986;

// ---------------------------------------------------------------------------
// Sun slices (the same formula the shader animates)
// ---------------------------------------------------------------------------

/** Gap k as [y, height] at a phase in 0..1; gaps move down and widen as the phase grows. */
function sliceGap(g: SceneGeometry, k: number, phase: number): [number, number] {
  const { top, bottom, bands, gap } = g.slices;
  const span = bottom - top;
  const start = (k + phase) / bands;
  const len = (gap * (k + phase)) / (bands * (bands - gap));
  return [top + start * span, len * span];
}

// ---------------------------------------------------------------------------
// Parts
// ---------------------------------------------------------------------------

interface Ctx {
  g: SceneGeometry;
  p: string;
  animated: boolean;
}

function defs(c: Ctx, parts: { backdrop: boolean; palms: boolean }): string {
  const { g, p } = c;
  const out: string[] = [];
  if (parts.backdrop) {
    out.push(
      `<linearGradient id="${p}sky" x1="0" y1="0" x2="0" y2="${n(g.horizon)}" gradientUnits="userSpaceOnUse">` +
        `<stop offset="0" stop-color="${scene.skyTop}"/><stop offset=".42" stop-color="${scene.skyMid}"/>` +
        `<stop offset=".8" stop-color="${scene.skyLow}"/><stop offset="1" stop-color="${scene.horizon}"/></linearGradient>`,
      `<linearGradient id="${p}sun" x1="0" y1="${n(g.sun.cy - g.sun.r)}" x2="0" y2="${n(g.sun.cy + g.sun.r * 0.7)}" gradientUnits="userSpaceOnUse">` +
        `<stop offset="0" stop-color="${scene.sunTop}"/><stop offset="1" stop-color="${scene.sunBottom}"/></linearGradient>`,
      `<radialGradient id="${p}halo"><stop offset="0" stop-color="${scene.sunBottom}" stop-opacity=".5"/>` +
        `<stop offset="1" stop-color="${scene.sunBottom}" stop-opacity="0"/></radialGradient>`,
      `<radialGradient id="${p}glow"><stop offset="0" stop-color="${scene.horizon}" stop-opacity=".9"/>` +
        `<stop offset=".5" stop-color="${scene.skyLow}" stop-opacity=".35"/><stop offset="1" stop-color="${scene.skyLow}" stop-opacity="0"/></radialGradient>`,
      `<linearGradient id="${p}water" x1="0" y1="${n(g.horizon)}" x2="0" y2="${n(g.height)}" gradientUnits="userSpaceOnUse">` +
        `<stop offset="0" stop-color="${scene.waterFar}"/><stop offset="1" stop-color="${scene.waterNear}"/></linearGradient>`,
      // Reflection bars fade out at both ends.
      `<linearGradient id="${p}bar"><stop offset="0" stop-color="${scene.sunBottom}" stop-opacity="0"/>` +
        `<stop offset=".5" stop-color="${scene.sunBottom}"/><stop offset="1" stop-color="${scene.sunBottom}" stop-opacity="0"/></linearGradient>`,
      `<linearGradient id="${p}bar2"><stop offset="0" stop-color="${scene.sunTop}" stop-opacity="0"/>` +
        `<stop offset=".5" stop-color="${scene.sunTop}"/><stop offset="1" stop-color="${scene.sunTop}" stop-opacity="0"/></linearGradient>`,
    );
  }
  if (parts.palms) out.push(palmSymbol(c));
  return out.length ? `<defs>${out.join('')}</defs>` : '';
}

/** Opacity of the dusk bands over the sun; the shader uses the same value. */
export const SLICE_ALPHA = 0.85;

function sunSlices(c: Ctx): string {
  const { g, p, animated } = c;
  const { cx, r } = g.sun;
  const x = n(cx - r - 2);
  const w = n(2 * r + 4);
  const gaps: string[] = [];
  for (let k = 0; k < g.slices.bands; k++) {
    const [y0, h0] = sliceGap(g, k, 0);
    if (y0 > g.horizon) break;
    if (!animated) {
      if (h0 >= 0.4) gaps.push(`<rect x="${x}" y="${n(y0)}" width="${w}" height="${n(h0)}"/>`);
      continue;
    }
    const [y1, h1] = sliceGap(g, k, 1);
    gaps.push(
      `<rect x="${x}" y="${n(y0)}" width="${w}" height="${n(h0)}">` +
        `<animate attributeName="y" values="${n(y0)};${n(y1)}" dur="9s" repeatCount="indefinite"/>` +
        `<animate attributeName="height" values="${n(h0)};${n(h1)}" dur="9s" repeatCount="indefinite"/></rect>`,
    );
  }
  // The gaps are bands of dusk across the sun, clipped to its disc.
  return (
    `<clipPath id="${p}disc"><circle cx="${n(cx)}" cy="${n(g.sun.cy)}" r="${n(r)}"/></clipPath>` +
    `<g id="${p}slices" clip-path="url(#${p}disc)" fill="${scene.skyMid}" opacity="${SLICE_ALPHA}">${gaps.join('')}</g>`
  );
}

function sky(c: Ctx): string {
  const { g, p } = c;
  return `<rect width="${n(g.width)}" height="${n(g.horizon + 1)}" fill="url(#${p}sky)"/>`;
}

/** Deterministic stars: three brightness classes as three paths; a few twinkle when animated. */
function stars(c: Ctx): string {
  const { g, animated, p } = c;
  const rand = prng(SEED);
  const count = Math.round(96 * (g.width / g.height / (16 / 9)));
  const classes: string[][] = [[], [], []];
  const twinkles: string[] = [];
  const limit = g.horizon - 150 * g.u;
  for (let i = 0; i < count; i++) {
    const x = rand() * g.width;
    // Denser near the top, where the sky is darkest.
    const y = rand() ** 1.6 * limit;
    const k = rand();
    const cls = k > 0.9 ? 0 : k > 0.55 ? 1 : 2;
    const d = Math.hypot(x - g.sun.cx, y - g.sun.cy);
    if (d < g.sun.r * 1.35) continue;
    const s = (cls === 0 ? 2.4 : cls === 1 ? 1.6 : 1.1) * Math.max(g.u, 0.5);
    if (animated && cls === 0 && twinkles.length < 10) {
      const dur = 2.4 + rand() * 3;
      twinkles.push(
        `<circle cx="${n(x)}" cy="${n(y)}" r="${n(s * 0.8)}"><animate attributeName="opacity" values="1;.15;1" dur="${n(dur)}s" begin="${n(-rand() * dur)}s" repeatCount="indefinite"/></circle>`,
      );
      continue;
    }
    classes[cls]!.push(`M${Math.round(x)} ${Math.round(y)}h${n(s)}v${n(s)}h-${n(s)}z`);
  }
  const op = ['.95', '.7', '.45'];
  return (
    // Starlight is the palette's ink, the one near-white in the tokens.
    `<g class="${p}stars" fill="${themes.night.ink}">` +
    classes.map((d, i) => (d.length ? `<path opacity="${op[i]}" d="${d.join('')}"/>` : '')).join('') +
    twinkles.join('') +
    `</g>`
  );
}

function sun(c: Ctx): string {
  const { g, p } = c;
  const { cx, cy, r } = g.sun;
  return (
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r * 2.3)}" fill="url(#${p}halo)"/>` +
    `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(r)}" fill="url(#${p}sun)"/>` +
    sunSlices(c)
  );
}

function horizonGlow(c: Ctx): string {
  const { g, p } = c;
  return (
    `<ellipse cx="${n(g.sun.cx)}" cy="${n(g.horizon)}" rx="${n(g.width * 0.55)}" ry="${n(70 * g.u)}" fill="url(#${p}glow)"/>`
  );
}

function ocean(c: Ctx): string {
  const { g, p, animated } = c;
  const depth = g.height - g.horizon;
  const rand = prng(SEED + 7);
  const rows = 15;
  const bars: string[] = [];
  for (let j = 0; j < rows; j++) {
    const t = (j + 0.5) / rows;
    const y = g.horizon + 3 * g.u + (depth - 6 * g.u) * t ** 1.55;
    const h = (1.6 + 5.2 * t) * g.u;
    const w = g.sun.r * (1.05 + 1.9 * t) * (0.72 + 0.4 * rand());
    const x = g.sun.cx - w / 2 + (rand() - 0.5) * 18 * g.u;
    const op = n(0.9 - 0.5 * t);
    const fill = j < 4 ? `${p}bar2` : `${p}bar`;
    const anim = animated
      ? `<animate attributeName="opacity" values="${op};${n(Number(op) * 0.35)};${op}" dur="${n(1.6 + rand() * 1.8)}s" begin="${n(-rand() * 3)}s" repeatCount="indefinite"/>` +
        `<animate attributeName="x" values="${n(x)};${n(x + (rand() - 0.5) * 24 * g.u)};${n(x)}" dur="${n(3 + rand() * 3)}s" repeatCount="indefinite"/>`
      : '';
    bars.push(
      `<rect x="${n(x)}" y="${n(y)}" width="${n(w)}" height="${n(h)}" fill="url(#${fill})" opacity="${op}">${anim}</rect>`,
    );
  }
  return (
    `<rect y="${n(g.horizon)}" width="${n(g.width)}" height="${n(depth)}" fill="url(#${p}water)"/>` +
    `<rect y="${n(g.horizon - 0.8 * g.u)}" width="${n(g.width)}" height="${n(1.6 * g.u)}" fill="${scene.horizon}" opacity=".85"/>` +
    `<g class="${p}bars">${bars.join('')}</g>`
  );
}

/** The vaporwave floor: horizontal lines denser toward the horizon, verticals meeting at the sun. */
function grid(c: Ctx): string {
  const { g, p } = c;
  const depth = g.height - g.horizon;
  const d: string[] = [];
  for (let k = 1; k <= 14; k++) {
    const y = g.horizon + depth * (k / 14) ** 2.2;
    d.push(`M0 ${n(y)}H${n(g.width)}`);
  }
  const step = 150 * g.u;
  const vx = g.sun.cx;
  const reach = Math.ceil((Math.max(vx, g.width - vx) * 6) / step);
  for (let i = -reach; i <= reach; i++) {
    // From the vanishing point on the horizon to the bottom edge; the clip trims the rest.
    d.push(`M${n(vx)} ${n(g.horizon)}L${n(vx + i * step)} ${n(g.height)}`);
  }
  return (
    `<linearGradient id="${p}fade" x1="0" y1="${n(g.horizon)}" x2="0" y2="${n(g.horizon + 90 * g.u)}" gradientUnits="userSpaceOnUse">` +
    `<stop offset="0" stop-color="#000"/><stop offset="1" stop-color="#fff"/></linearGradient>` +
    `<mask id="${p}floor" maskUnits="userSpaceOnUse" x="0" y="${n(g.horizon)}" width="${n(g.width)}" height="${n(depth)}">` +
    `<rect y="${n(g.horizon)}" width="${n(g.width)}" height="${n(depth)}" fill="url(#${p}fade)"/></mask>` +
    `<g mask="url(#${p}floor)" fill="none" stroke="${vaporwave.grid}" stroke-width="${n(1.4 * g.u)}" opacity=".75">` +
    `<path d="${d.join('')}"/></g>`
  );
}

// ---------------------------------------------------------------------------
// Skyline: our own Art Deco shapes (stepped crowns, rounded corners, a fin,
// a spire, eyebrow window bands)
// ---------------------------------------------------------------------------

type Kind = 'stepped' | 'rounded' | 'spire' | 'fin' | 'block';

/** One skyline module: width and height in 900-unit scene units, and a gap after it. */
const BLOCKS: [Kind, number, number, number][] = [
  ['spire', 64, 150, 8],
  ['stepped', 112, 176, 4],
  ['rounded', 84, 108, 10],
  ['spire', 58, 236, 6],
  ['fin', 118, 138, 4],
  ['rounded', 92, 94, 12],
  ['stepped', 72, 164, 6],
  ['block', 96, 74, 8],
  ['rounded', 104, 126, 6],
  ['fin', 70, 190, 10],
  ['stepped', 124, 112, 6],
  ['block', 60, 58, 12],
];

/** Closed silhouette and open neon contour of one building. */
function building(kind: Kind, x: number, base: number, w: number, h: number): { fill: string; edge: string } {
  const X = (f: number) => n(x + f * w);
  const Y = (f: number) => n(base - f * h);
  switch (kind) {
    case 'stepped': {
      const top = `V${Y(0.7)}H${X(0.1)}V${Y(0.84)}H${X(0.24)}V${Y(1)}H${X(0.76)}V${Y(0.84)}H${X(0.9)}V${Y(0.7)}H${X(1)}V${n(base)}`;
      return { fill: `M${X(0)} ${n(base)}${top}Z`, edge: `M${X(0)} ${n(base)}${top}` };
    }
    case 'rounded': {
      const rr = Math.min(w * 0.42, h * 0.5);
      const top = `V${n(base - h + rr)}Q${X(0)} ${Y(1)} ${n(x + rr)} ${Y(1)}H${X(1)}V${n(base)}`;
      return { fill: `M${X(0)} ${n(base)}${top}Z`, edge: `M${X(0)} ${n(base)}${top}` };
    }
    case 'spire': {
      const top =
        `V${Y(0.68)}H${X(0.16)}V${Y(0.76)}H${X(0.32)}V${Y(0.84)}H${X(0.46)}L${X(0.5)} ${Y(1)}L${X(0.54)} ${Y(0.84)}` +
        `H${X(0.68)}V${Y(0.76)}H${X(0.84)}V${Y(0.68)}H${X(1)}V${n(base)}`;
      return { fill: `M${X(0)} ${n(base)}${top}Z`, edge: `M${X(0)} ${n(base)}${top}` };
    }
    case 'fin': {
      const top = `V${Y(0.78)}H${X(0.42)}V${Y(1)}H${X(0.58)}V${Y(0.78)}H${X(1)}V${n(base)}`;
      return { fill: `M${X(0)} ${n(base)}${top}Z`, edge: `M${X(0.42)} ${Y(0.78)}V${Y(1)}H${X(0.58)}V${Y(0.78)}` };
    }
    default: {
      const top = `V${Y(0.92)}H${X(0.06)}V${Y(1)}H${X(0.94)}V${Y(0.92)}H${X(1)}V${n(base)}`;
      return { fill: `M${X(0)} ${n(base)}${top}Z`, edge: `M${X(0.06)} ${Y(0.92)}V${Y(1)}H${X(0.94)}V${Y(0.92)}` };
    }
  }
}

function skyline(c: Ctx): string {
  const { g, p, animated } = c;
  const u = g.u;
  const base = g.horizon + 1.5 * u;
  const clearL = g.sun.cx - g.sun.r - 70 * u;
  const clearR = g.sun.cx + g.sun.r + 70 * u;
  const fills: string[] = [];
  const pink: string[] = [];
  const cyan: string[] = [];
  const windows: string[] = [];
  let x = -18 * u;
  let i = 0;
  while (x < g.width) {
    const [kind, bw, bh, gap] = BLOCKS[i % BLOCKS.length]!;
    const w = bw * u;
    const h = bh * u;
    if (x + w > clearL && x < clearR) {
      // Keep the sun and its slices clear: low beach huts only under it.
      x = clearR;
      i++;
      continue;
    }
    const b = building(kind, x, base, w, h);
    fills.push(b.fill);
    (i % 3 === 1 ? cyan : pink).push(b.edge);
    // Eyebrow window bands on the wider blocks.
    if (w > 70 * u) {
      for (let y = base - 16 * u; y > base - h * 0.62; y -= 15 * u) {
        windows.push(`M${n(x + w * 0.16)} ${n(y)}h${n(w * 0.68)}v${n(2.6 * u)}h-${n(w * 0.68)}z`);
      }
    }
    x += w + gap * u;
    i++;
  }
  const sw = n(1.6 * u);
  const glow = n(6 * u);
  const flicker = animated
    ? `<animate attributeName="opacity" values="1;1;.35;1;.8;1;1" keyTimes="0;.62;.64;.66;.7;.72;1" dur="7s" repeatCount="indefinite"/>`
    : '';
  const edges = (color: string, d: string[]) =>
    d.length
      ? `<path d="${d.join('')}" stroke="${color}" stroke-width="${glow}" opacity=".22"/><path d="${d.join('')}" stroke="${color}" stroke-width="${sw}"/>`
      : '';
  return (
    `<g class="${p}skyline"><path fill="${scene.silhouette}" d="${fills.join('')}"/>` +
    (windows.length ? `<path fill="${scene.sunTop}" opacity=".32" d="${windows.join('')}"/>` : '') +
    `<g class="${p}neon" fill="none" stroke-linejoin="round">${flicker}${edges(scene.neonPink, pink)}${edges(scene.neonCyan, cyan)}</g></g>`
  );
}

// ---------------------------------------------------------------------------
// Palms: one symbol (a tapered curved trunk and feathered fronds), reused
// ---------------------------------------------------------------------------

/** Frond polygon along a quadratic curve from the crown, with a toothed lower edge. */
function frond(angle: number, length: number, droop: number): string {
  const a = (angle * Math.PI) / 180;
  const tip = [Math.cos(a) * length, Math.sin(a) * length + droop];
  const ctrl = [Math.cos(a) * length * 0.5, Math.sin(a) * length * 0.5 - length * 0.28];
  const at = (t: number) => {
    const m = 1 - t;
    return [2 * m * t * ctrl[0]! + t * t * tip[0]!, 2 * m * t * ctrl[1]! + t * t * tip[1]!];
  };
  const normal = (t: number) => {
    const m = 1 - t;
    const dx = 2 * m * ctrl[0]! + 2 * t * (tip[0]! - ctrl[0]!);
    const dy = 2 * m * ctrl[1]! + 2 * t * (tip[1]! - ctrl[1]!);
    const len = Math.hypot(dx, dy) || 1;
    return [-dy / len, dx / len];
  };
  const upper: string[] = [];
  const lower: string[] = [];
  const steps = 12;
  for (let s = 1; s <= steps; s++) {
    const t = s / steps;
    const [x, y] = at(t);
    const [nx, ny] = normal(t);
    const w = 16 * Math.sin(Math.PI * Math.min(1, 0.18 + t * 0.95)) * (1 - t * 0.35);
    upper.push(`${Math.round(x! - nx! * w * 0.35)} ${Math.round(y! - ny! * w * 0.35)}`);
    // Leaflets hang below the rib; every third step a notch cuts back to it.
    const k = s % 3 === 0 ? 0.15 : 1;
    lower.unshift(`${Math.round(x! + nx! * w * k)} ${Math.round(y! + ny! * w * k)}`);
  }
  return `M0 0L${upper.join('L')}L${lower.join('L')}Z`;
}

function palmSymbol(c: Ctx): string {
  const { p } = c;
  const trunk = 'M-5 6C10 150 30 330 54 560L88 560C58 330 30 150 7 4Z';
  const rings: string[] = [];
  for (let k = 0; k < 11; k++) {
    const t = k / 11;
    const y = 30 + t * 520;
    const x = -2 + 60 * t ** 1.3;
    rings.push(`M${Math.round(x)} ${Math.round(y)}h${Math.round(14 + 22 * t)}v3h-${Math.round(14 + 22 * t)}z`);
  }
  const fronds = [
    frond(-168, 150, 70),
    frond(-140, 140, 30),
    frond(-112, 118, -6),
    frond(-72, 122, -4),
    frond(-38, 150, 34),
    frond(-8, 160, 78),
    frond(150, 110, 60),
    frond(28, 120, 82),
  ];
  return (
    `<symbol id="${p}palm" overflow="visible"><path d="${trunk}"/>` +
    `<path d="${rings.join('')}" fill="${scene.skyTop}" opacity=".55"/><path d="${fronds.join('')}"/>` +
    `<circle cx="2" cy="6" r="9"/></symbol>`
  );
}

function palms(c: Ctx): string {
  const { g, p } = c;
  const u = g.u;
  // [crown x, crown y, scale, mirrored]; right side measured from the right edge.
  const set: [number, number, number, boolean][] = [
    [g.width - 150 * u, 250 * u, 1.05 * u, true],
    [g.width - 262 * u, 382 * u, 0.72 * u, false],
    [110 * u, 214 * u, 1.1 * u, false],
    [-24 * u, 330 * u, 0.86 * u, true],
  ];
  const W = g.width;
  const H = g.height;
  // A dark foreground shore on both sides, where the palms stand.
  const shore =
    `<path d="M0 ${n(H - 120 * u)}C${n(160 * u)} ${n(H - 132 * u)} ${n(300 * u)} ${n(H - 70 * u)} ${n(420 * u)} ${n(H)}H0Z` +
    `M${n(W)} ${n(H - 150 * u)}C${n(W - 190 * u)} ${n(H - 160 * u)} ${n(W - 360 * u)} ${n(H - 80 * u)} ${n(W - 470 * u)} ${n(H)}H${n(W)}Z"/>`;
  return (
    `<g class="${p}palms" fill="${scene.silhouette}">` +
    shore +
    set
      .map(
        ([x, y, s, m]) =>
          `<use href="#${p}palm" transform="translate(${n(x)} ${n(y)}) scale(${m ? '-' : ''}${n(s)} ${n(s)})"/>`,
      )
      .join('') +
    `</g>`
  );
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function open(opts: SceneSvgOptions, extra = ''): string {
  const { width, height } = opts;
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${n(width)} ${n(height)}" width="${n(width)}" height="${n(height)}"${extra}>`;
}

function ctx(opts: SceneSvgOptions): Ctx {
  return {
    g: sceneGeometry(opts.width, opts.height, opts.sunX ?? SUN_X),
    p: opts.idPrefix ?? 'rg-',
    animated: Boolean(opts.animated),
  };
}

/** The complete scene as one <svg> string. Palms and skyline default on, grid off. */
export function sceneSvg(opts: SceneSvgOptions): string {
  const c = ctx(opts);
  const showPalms = opts.palms ?? true;
  const showSkyline = opts.skyline ?? true;
  return (
    open(opts) +
    defs(c, { backdrop: true, palms: showPalms }) +
    sky(c) +
    stars(c) +
    sun(c) +
    horizonGlow(c) +
    ocean(c) +
    (opts.grid ? grid(c) : '') +
    (showSkyline ? skyline(c) : '') +
    (showPalms ? palms(c) : '') +
    `</svg>`
  );
}

/** Only the skyline and palms on a transparent ground, to layer over the live canvas. */
export function sceneSilhouettesSvg(opts: SceneSvgOptions): string {
  const c = ctx(opts);
  const showPalms = opts.palms ?? true;
  return (
    open(opts) +
    defs(c, { backdrop: false, palms: showPalms }) +
    ((opts.skyline ?? true) ? skyline(c) : '') +
    (showPalms ? palms(c) : '') +
    `</svg>`
  );
}

/** Only the vaporwave floor grid on a transparent ground. */
export function sceneGridSvg(opts: SceneSvgOptions): string {
  return open(opts) + grid(ctx(opts)) + `</svg>`;
}
