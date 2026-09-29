/**
 * Shared atoms for the README cards, in the site's world (a 1986 Miami
 * night with a console-menu UI), built only from src/design/tokens.ts:
 * satori text styles (outlined display titles, HUD numerals, plates) and
 * SVG art (the night band, stars, menu frames, scanlines).
 */

import { scene, themes, type Role, type Theme } from '../../../src/design/tokens.ts';
import { type Child, h, type VNode } from './h.ts';
import { DISPLAY, HUD, SANS, SCRIPT } from './fonts.ts';

export const T: Theme = themes.night;
export const S = scene;

/** `T.added` / `T.onAdded`, keyed by role name. */
export function roleColors(role: Role): { bg: string; fg: string } {
  const onKey = `on${role[0]!.toUpperCase()}${role.slice(1)}` as keyof Theme;
  return { bg: T[role], fg: T[onKey] as string };
}

/** A flex container; satori requires an explicit display on every element with children. */
export function flex(style: Record<string, unknown>, ...children: (Child | Child[])[]): VNode {
  return h('div', { style: { display: 'flex', ...style } }, ...children);
}

/** A text leaf. */
export function text(style: Record<string, unknown>, content: string): VNode {
  return h('div', { style }, content);
}

/**
 * Display title style: white Luckiest Guy with a heavy dark outline (the
 * hard drop comes from `display`). `size` in px.
 */
export function displayStyle(size: number, color: string = T.ink): Record<string, unknown> {
  return {
    fontFamily: DISPLAY,
    fontSize: size,
    lineHeight: 1.05,
    color,
    letterSpacing: '0.01em',
    WebkitTextStroke: `${Math.max(3, Math.round(size / 9))}px ${S.silhouette}`,
    whiteSpace: 'pre',
  };
}

/**
 * Text with a hard drop: an outlined dark copy offset down-right behind
 * the real one (no filter, so it renders the same everywhere).
 */
export function dropped(style: Record<string, unknown>, content: string, drop: number): VNode {
  return flex(
    { position: 'relative', flexShrink: 0 },
    text({ ...style, position: 'absolute', left: drop, top: drop, color: S.silhouette }, content),
    text(style, content),
  );
}

/** A display title: outlined Luckiest Guy with its hard drop. */
export function display(content: string, size: number, color: string = T.ink): VNode {
  return dropped(displayStyle(size, color), content, Math.max(3, Math.round(size / 12)));
}

/** HUD numeral style: Orbitron Black in a role color with a dark outline, no panel. */
export function hudStyle(size: number, color: string): Record<string, unknown> {
  return {
    fontFamily: HUD,
    fontWeight: 900,
    fontSize: size,
    lineHeight: 1,
    color,
    WebkitTextStroke: `${Math.max(2, Math.round(size / 12))}px ${S.silhouette}`,
    whiteSpace: 'pre',
  };
}

/** A HUD numeral with its small drop. */
export function hud(content: string, size: number, color: string): VNode {
  return dropped(hudStyle(size, color), content, Math.max(2, Math.round(size / 18)));
}

/** Body text on the night. */
export function bodyStyle(size: number, color: string = T.ink2, weight = 400): Record<string, unknown> {
  return { fontFamily: SANS, fontWeight: weight, fontSize: size, lineHeight: 1.35, color };
}

export interface PlateOpts {
  fontSize?: number;
  padX?: number;
  padY?: number;
  font?: string;
  weight?: number;
}

/** A solid plate (status, tool chip, site address): rounded like the menu's highlight bar. */
export function plate(label: string, bg: string, fg: string, opts: PlateOpts = {}): VNode {
  const { fontSize = 18, padX = 12, padY = 6, font = SANS, weight = 700 } = opts;
  return flex(
    { alignItems: 'center', backgroundColor: bg, color: fg, padding: `${padY}px ${padX}px`, borderRadius: 6, flexShrink: 0 },
    text({ fontFamily: font, fontWeight: weight, fontSize, lineHeight: 1.1, whiteSpace: 'pre' }, label),
  );
}

/** A role plate (the status tag on work cards). */
export function rolePlate(role: Role, label: string, opts: PlateOpts = {}): VNode {
  const { bg, fg } = roleColors(role);
  return plate(label, bg, fg, opts);
}

/** An outlined chip (tool names under a method step): neon edge, dark fill. */
export function chip(label: string, color: string, opts: PlateOpts = {}): VNode {
  const { fontSize = 18, padX = 12, padY = 5 } = opts;
  return flex(
    { alignItems: 'center', border: `2px solid ${color}`, backgroundColor: T.night, color, padding: `${padY}px ${padX}px`, borderRadius: 6, flexShrink: 0 },
    text({ fontFamily: SANS, fontWeight: 600, fontSize, lineHeight: 1.1, whiteSpace: 'pre' }, label),
  );
}

/**
 * Proof line for a card: at most `max` proofs, and never more characters
 * than fit one line of the card (proofs are dropped whole, never cut).
 */
export function joinProofs(proofs: { value: string; label: string }[], max = 3, maxChars = 52): string {
  const parts: string[] = [];
  for (const p of proofs.slice(0, max)) {
    const part = `${p.value} ${p.label}`;
    const next = parts.length ? `${parts.join(' · ')} · ${part}` : part;
    if (parts.length && next.length > maxChars) break;
    parts.push(part);
  }
  return parts.join(' · ');
}

/** "Rodrigo Gomes da Silva" -> ["Rodrigo", "GOMES DA SILVA"]: the signature over the outlined surname. */
export function lockupLines(name: string): [string, string] {
  const [first = name, ...rest] = name.split(' ');
  return [first, rest.join(' ').toUpperCase()];
}

// ---------------------------------------------------------------------------
// SVG art
// ---------------------------------------------------------------------------

/** Deterministic PRNG (mulberry32): the same art on every build. */
export function prng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Small stars scattered over a box; `twinkle` adds a CSS class to one in five. */
export function stars(opts: { x: number; y: number; width: number; height: number; count: number; seed: number; twinkleClass?: string }): string {
  const rand = prng(opts.seed);
  let out = '';
  for (let i = 0; i < opts.count; i++) {
    const cx = r1(opts.x + rand() * opts.width);
    const cy = r1(opts.y + rand() * opts.height);
    const r = r1(0.6 + rand() * 1.3);
    const o = r1(0.35 + rand() * 0.6);
    const cls = opts.twinkleClass && i % 5 === 0 ? ` class="${opts.twinkleClass}"` : '';
    out += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${T.ink}" opacity="${o}"${cls}/>`;
  }
  return out;
}

/** The night band: a clean vertical gradient from the top of the sky to the page night. */
export function nightBandDefs(id: string): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">` +
    `<stop offset="0" stop-color="${S.skyTop}"/><stop offset="0.7" stop-color="${T.night}"/><stop offset="1" stop-color="${S.waterNear}"/>` +
    '</linearGradient>'
  );
}

/** CRT scanlines as a pattern: 1px dark lines every 4px, very low contrast. */
export function scanlineDefs(id: string): string {
  return `<pattern id="${id}" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="4" height="1" fill="#000" opacity="0.22"/></pattern>`;
}

export interface FrameOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Corner offsets that tilt the panel like a framed postcard, in px. */
  tilt?: number;
  fill?: string;
  border?: string;
  /** Neon edge color drawn just inside the border. */
  edge?: string;
}

/**
 * A console-menu frame: a thick dark border around a raised panel, its
 * corners nudged so it floats slightly tilted, with a thin neon edge.
 */
export function menuFrame(o: FrameOptions): string {
  const t = o.tilt ?? 6;
  const { x, y, width: w, height: hgt } = o;
  const pts = (inset: number) =>
    [
      [x + inset, y + t + inset],
      [x + w - inset, y + inset],
      [x + w - t - inset, y + hgt - inset],
      [x + t + inset, y + hgt - t / 2 - inset],
    ]
      .map(([px, py]) => `${r1(px!)},${r1(py!)}`)
      .join(' ');
  return (
    `<polygon points="${pts(0)}" fill="${o.border ?? '#05020F'}" stroke="${o.border ?? '#05020F'}" stroke-width="10" stroke-linejoin="round"/>` +
    `<polygon points="${pts(8)}" fill="${o.fill ?? T.panel}"/>` +
    (o.edge ? `<polygon points="${pts(12)}" fill="none" stroke="${o.edge}" stroke-width="2" stroke-linejoin="round" opacity="0.85"/>` : '')
  );
}

/**
 * One soft neon glow (a single feGaussianBlur under the source). The
 * filter region is given in user space (the whole card) because resvg
 * cannot size a bounding-box region around `<text>`.
 */
export function glowDefs(id: string, width: number, height: number, blur = 6): string {
  return (
    `<filter id="${id}" filterUnits="userSpaceOnUse" x="0" y="0" width="${width}" height="${height}">` +
    `<feGaussianBlur in="SourceGraphic" stdDeviation="${blur}" result="b"/>` +
    '<feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>'
  );
}

/** A left-side scrim: the night, fading to clear, so text on the scene keeps its contrast. */
export function scrimDefs(id: string, opacity = 0.88): string {
  return (
    `<linearGradient id="${id}" x1="0" y1="0" x2="1" y2="0">` +
    `<stop offset="0" stop-color="${T.night}" stop-opacity="${opacity}"/>` +
    `<stop offset="0.6" stop-color="${T.night}" stop-opacity="${r1(opacity * 0.7)}"/>` +
    `<stop offset="1" stop-color="${T.night}" stop-opacity="0"/></linearGradient>`
  );
}

/**
 * The signature lockup: "Rodrigo" in pink brush script over the outlined
 * surname. Returned as two nodes so the script can sit in its own glowing
 * layer.
 */
export function lockup(name: string, scale = 1): { script: VNode; surname: VNode; scriptSize: number; surnameSize: number } {
  const [first, rest] = lockupLines(name);
  const scriptSize = Math.round(118 * scale);
  const surnameSize = Math.round(70 * scale);
  return {
    script: text({ fontFamily: SCRIPT, fontSize: scriptSize, lineHeight: 1, color: T.brand, whiteSpace: 'pre' }, first),
    surname: display(rest, surnameSize),
    scriptSize,
    surnameSize,
  };
}

/** The site address plate (cyan, like the site's product plates). */
export function sitePlate(site: string, fontSize = 20): VNode {
  return rolePlate('added', site.replace(/^https?:\/\//, ''), { fontSize, padX: 14, padY: 8, weight: 800 });
}
