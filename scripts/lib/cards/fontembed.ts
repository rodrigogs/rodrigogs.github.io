/**
 * Embedded fonts for card text: satori lays the text out (and positions
 * every word), the card keeps it as real `<text>`, and each face it uses
 * is subset to exactly the characters on the card and embedded as a
 * base64 `@font-face` in the SVG's own <style>. GitHub shows README
 * images through an <img>, which never fetches external fonts but does
 * honor inline data URIs, so the faces render there as designed; subset
 * fonts keep a text-heavy card an order of magnitude smaller than glyph
 * outlines would.
 *
 * Subsetting runs HarfBuzz's own subsetter (hb-subset.wasm, from the
 * harfbuzzjs package satori already uses).
 */

import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { FACES, faceData, type Face } from './fonts.ts';

const require = createRequire(import.meta.url);

/** CSS family name used inside the cards, so a locally installed copy never replaces the embedded one. */
export const cssFamily = (family: string): string => `rg-${family.toLowerCase().replace(/\s+/g, '-')}`;

interface HbExports {
  memory: WebAssembly.Memory;
  malloc(n: number): number;
  free(p: number): void;
  hb_blob_create(data: number, len: number, mode: number, user: number, destroy: number): number;
  hb_blob_destroy(b: number): void;
  hb_blob_get_data(b: number, len: number): number;
  hb_blob_get_length(b: number): number;
  hb_face_create(b: number, i: number): number;
  hb_face_destroy(f: number): void;
  hb_face_reference_blob(f: number): number;
  hb_set_add(s: number, cp: number): void;
  hb_subset_input_create_or_fail(): number;
  hb_subset_input_destroy(i: number): void;
  hb_subset_input_set_flags(i: number, flags: number): void;
  hb_subset_input_unicode_set(i: number): number;
  hb_subset_or_fail(f: number, i: number): number;
}

let hb: HbExports | null = null;

async function harfbuzz(): Promise<HbExports> {
  if (hb) return hb;
  const wasm = readFileSync(require.resolve('harfbuzzjs/hb-subset.wasm'));
  const { instance } = await WebAssembly.instantiate(wasm);
  hb = instance.exports as unknown as HbExports;
  return hb;
}

const HB_MEMORY_MODE_WRITABLE = 2;
const HB_SUBSET_FLAGS_NO_HINTING = 0x1;

/** A TTF holding only the glyphs for `chars` (plus .notdef), unhinted. */
export async function subsetFont(font: Uint8Array, chars: Iterable<string>): Promise<Uint8Array> {
  const x = await harfbuzz();
  const ptr = x.malloc(font.byteLength);
  new Uint8Array(x.memory.buffer).set(font, ptr);
  const blob = x.hb_blob_create(ptr, font.byteLength, HB_MEMORY_MODE_WRITABLE, 0, 0);
  const face = x.hb_face_create(blob, 0);
  x.hb_blob_destroy(blob);
  const input = x.hb_subset_input_create_or_fail();
  x.hb_subset_input_set_flags(input, HB_SUBSET_FLAGS_NO_HINTING);
  const set = x.hb_subset_input_unicode_set(input);
  for (const ch of chars) x.hb_set_add(set, ch.codePointAt(0)!);
  const subset = x.hb_subset_or_fail(face, input);
  x.hb_subset_input_destroy(input);
  try {
    if (!subset) throw new Error('font subsetting failed');
    const out = x.hb_face_reference_blob(subset);
    const at = x.hb_blob_get_data(out, 0);
    const len = x.hb_blob_get_length(out);
    // Copy out before freeing: the wasm heap view is invalidated by later calls.
    const result = new Uint8Array(x.memory.buffer, at, len).slice();
    x.hb_blob_destroy(out);
    if (len === 0) throw new Error('font subsetting produced an empty font');
    return result;
  } finally {
    if (subset) x.hb_face_destroy(subset);
    x.hb_face_destroy(face);
    x.free(ptr);
  }
}

const decode = (s: string): string =>
  s.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&#(\d+);/g, (_, n: string) => String.fromCodePoint(Number(n))).replace(/&amp;/g, '&');

function faceOf(family: string, weight: string): Face | undefined {
  const w = weight === 'normal' ? 400 : weight === 'bold' ? 700 : Number(weight);
  return FACES.find((f) => cssFamily(f.family) === family && f.weight === w);
}

/**
 * The `@font-face` rules for every face the `<text>` elements in `markup`
 * use, each subset to the characters that face actually draws.
 */
export async function fontFaceCss(markup: string): Promise<string> {
  const used = new Map<Face, Set<string>>();
  for (const m of markup.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)) {
    const attrs = m[1]!;
    const family = /font-family="([^"]+)"/.exec(attrs)?.[1];
    const weight = /font-weight="([^"]+)"/.exec(attrs)?.[1] ?? '400';
    if (!family) continue;
    const face = faceOf(family, weight);
    if (!face) throw new Error(`card text uses a face that is not registered: ${family} ${weight}`);
    const set = used.get(face) ?? new Set<string>();
    for (const ch of decode(m[2]!)) set.add(ch);
    used.set(face, set);
  }
  let css = '';
  for (const face of FACES) {
    const chars = used.get(face);
    if (!chars) continue;
    const data = await subsetFont(faceData(face), chars);
    css +=
      `@font-face{font-family:'${cssFamily(face.family)}';font-weight:${face.weight};font-style:normal;` +
      `src:url(data:font/ttf;base64,${Buffer.from(data).toString('base64')}) format('truetype')}`;
  }
  return css;
}

/**
 * Maps the embedded family names back to the real ones, for rasterizing a
 * card with resvg (which reads font files, not `@font-face`).
 */
export function withRealFamilies(svg: string): string {
  let out = svg;
  for (const f of FACES) out = out.split(`font-family="${cssFamily(f.family)}"`).join(`font-family="${f.family}"`);
  return out;
}
