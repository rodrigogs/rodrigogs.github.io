/**
 * Card composition: every card is one hand-written SVG document (the art:
 * scene, frames, buildings, icons) with its text laid out by satori on
 * top. Text stays real `<text>` in the card's own subset fonts (see
 * fontembed.ts); `glyphs: true` asks for glyph outlines instead, for the
 * PNGs resvg rasterizes.
 *
 * Satori's own output is post-processed: its unreferenced clip masks are
 * dropped, its ids are prefixed per layer (a card can hold several text
 * layers), words on one line are merged back into one `<text>` run, and
 * coordinates are rounded.
 */

import satori, { type SatoriOptions } from 'satori';
import { cssFamily, fontFaceCss } from './fontembed.ts';
import { loadFonts } from './fonts.ts';
import { h, type Child, type VNode } from './h.ts';

export const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * Rounds the decimal numbers inside attribute values (path data,
 * positions) to `decimals` places. Satori writes one decimal; at the sizes these cards
 * are shown (a 1280px card drawn at about 830px), whole pixels are
 * invisible for display type, one decimal is kept for body text.
 */
export function roundNumbers(markup: string, decimals = 0): string {
  const f = 10 ** decimals;
  // Attribute values only: text content (versions, "2.5x") is never touched.
  return markup.replace(/="([^"]*)"/g, (_, value: string) => `="${value.replace(/-?\d+\.\d+/g, (m) => String(Math.round(Number(m) * f) / f))}"`);
}

/** Drops satori's `<mask>` elements nobody references (it emits one per box). */
function dropUnusedMasks(markup: string): string {
  return markup.replace(/<mask id="([^"]+)">.*?<\/mask>/g, (whole, id: string) => (markup.includes(`url(#${id})`) ? whole : ''));
}

/** Prefixes every id and id reference so two layers in one document never collide. */
export function prefixIds(markup: string, prefix: string): string {
  return markup.replace(/\bid="([^"]+)"/g, `id="${prefix}-$1"`).replace(/url\(#([^)]+)\)/g, `url(#${prefix}-$1)`);
}

/** The children of a complete `<svg>…</svg>` string. */
export function svgInner(svg: string): string {
  return svg.replace(/^\s*<svg[^>]*>/, '').replace(/<\/svg>\s*$/, '');
}

/** Places a complete `<svg>` document inside another one at (x, y), keeping its own viewBox. */
export function embedSvg(svg: string, x = 0, y = 0): string {
  return svg.replace(/^\s*<svg\b/, `<svg x="${x}" y="${y}"`);
}

/** An absolutely positioned box inside a text layer. */
export function at(x: number, y: number, node: Child, style: Record<string, unknown> = {}): VNode {
  return h('div', { style: { position: 'absolute', left: x, top: y, display: 'flex', ...style } }, node);
}

export interface TextLayerOptions {
  width: number;
  height: number;
  /** Id prefix for this layer, unique within the card. */
  id: string;
  /** Glyph outlines instead of `<text>` (for resvg). */
  glyphs?: boolean;
}

/**
 * Satori writes one `<text>` per word, each with its measured x and width.
 * Adjacent words that share every other attribute and touch on one line
 * become one run again: the same font draws them the same way, in a tenth
 * of the markup.
 */
export function mergeTextRuns(markup: string): string {
  return markup.replace(/(?:<text [^>]*>[^<]*<\/text>)+/g, (run) => {
    const items = [...run.matchAll(/<text ([^>]*)>([^<]*)<\/text>/g)].map((m) => {
      const attrs = m[1]!;
      const num = (name: string) => Number(new RegExp(`(?:^|\\s)${name}="([^"]+)"`).exec(attrs)?.[1] ?? 0);
      const rest = attrs.replace(/(?:^|\s)(x|width|height)="[^"]*"/g, '').trim();
      return { x: num('x'), width: num('width'), rest, content: m[2]! };
    });
    let out = '';
    let i = 0;
    while (i < items.length) {
      const first = items[i]!;
      let content = first.content;
      let end = first.x + first.width;
      let j = i + 1;
      while (j < items.length && items[j]!.rest === first.rest && Math.abs(items[j]!.x - end) < 0.75) {
        content += items[j]!.content;
        end = items[j]!.x + items[j]!.width;
        j++;
      }
      if (content.trim()) out += `<text x="${first.x}" ${first.rest}>${content.replace(/\s+$/, '')}</text>`;
      i = j;
    }
    return out;
  });
}

/** Satori lowercases family names; the card uses its own embedded names. */
const renameFamilies = (markup: string): string => markup.replace(/font-family="([^"]+)"/g, (_, f: string) => `font-family="${cssFamily(f)}"`);

/** Satori's raw SVG to card-ready layer markup. */
function postProcess(svg: string, id: string, glyphs: boolean): string {
  const inner = dropUnusedMasks(svgInner(svg));
  const body = glyphs ? roundNumbers(inner, 0) : roundNumbers(mergeTextRuns(renameFamilies(inner)), 1).replace(/ font-style="normal"/g, '');
  return prefixIds(body, id);
}

async function render(node: VNode, size: { width: number; height?: number }, glyphs: boolean): Promise<string> {
  return satori(node as unknown as never, { ...size, fonts: loadFonts(), embedFont: glyphs } as SatoriOptions);
}

/**
 * Lays out `children` (usually `at(...)` boxes) on a transparent canvas the
 * size of the card and returns its markup, ready to drop into the card.
 */
export async function textLayer(children: Child[], opts: TextLayerOptions): Promise<string> {
  const root = h('div', { style: { display: 'flex', position: 'relative', width: opts.width, height: opts.height } }, ...children);
  return postProcess(await render(root, { width: opts.width, height: opts.height }, opts.glyphs ?? false), opts.id, opts.glyphs ?? false);
}

export interface DocumentOptions {
  width: number;
  height: number;
  /** Accessible name: becomes the <title> and the aria-label. */
  title: string;
  defs?: string;
  style?: string;
  body: string;
}

/**
 * A complete, self-contained card document with an accessible name and
 * the subset fonts its `<text>` needs.
 */
export async function svgDocument(opts: DocumentOptions): Promise<string> {
  const t = escapeXml(opts.title.trim());
  const style = (await fontFaceCss(opts.body)) + (opts.style ?? '');
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${opts.width}" height="${opts.height}" viewBox="0 0 ${opts.width} ${opts.height}" role="img" aria-label="${t}">` +
    `<title>${t}</title>` +
    (style ? `<style>${style}</style>` : '') +
    (opts.defs ? `<defs>${opts.defs}</defs>` : '') +
    opts.body +
    '</svg>'
  );
}

/**
 * Lays out one node at a fixed width and lets satori size the height from
 * the content; returns the markup and that height.
 */
export async function flowLayer(node: VNode, opts: { width: number; id: string; glyphs?: boolean }): Promise<{ markup: string; height: number }> {
  const svg = await render(node, { width: opts.width }, opts.glyphs ?? false);
  const m = /\sheight="([\d.]+)"/.exec(svg);
  return { markup: postProcess(svg, opts.id, opts.glyphs ?? false), height: Math.ceil(Number(m?.[1] ?? 0)) };
}
