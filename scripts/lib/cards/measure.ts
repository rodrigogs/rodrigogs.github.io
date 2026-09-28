/**
 * Measures the rendered pixel width of a vnode by asking satori to lay it
 * out with only a height constraint, so its width comes out content-fit.
 * Used to give a row of same-shaped plates (e.g. the header's role tags)
 * one shared column width without guessing at font metrics by hand.
 */

import satori, { type SatoriOptions } from 'satori';
import { loadFonts } from './fonts.ts';
import type { VNode } from './h.ts';

/** Any height works; only the resulting width attribute is read. */
const PROBE_HEIGHT = 200;

export async function measureWidth(node: VNode): Promise<number> {
  const svg = await satori(node as unknown as never, { height: PROBE_HEIGHT, fonts: loadFonts() } as SatoriOptions);
  const m = /\swidth="([\d.]+)"/.exec(svg);
  return m ? Math.ceil(Number(m[1])) : 0;
}
