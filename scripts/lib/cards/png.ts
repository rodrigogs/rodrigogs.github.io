/**
 * PNG provenance: every shipping raster says where it came from, in a
 * tEXt chunk keyed `impeccable:prompt` (the key Impeccable's provenance
 * scan reads). These rasters are drawn from code, not generated.
 */

import { crc32 } from 'node:zlib';

export const PROVENANCE_KEY = 'impeccable:prompt';

export const OG_PROVENANCE =
  'origin: rendered at build time by scripts/render-cards.ts (Satori + resvg) from src/data/snapshot.json, src/content/site.ts and the scene in src/design/scene-svg.ts; no image generation';

/** Returns a copy of `png` with a tEXt chunk inserted before IEND. */
export function withPngText(png: Uint8Array, key: string, text: string): Buffer {
  const iend = Buffer.from(png).lastIndexOf(Buffer.from('IEND', 'latin1')) - 4;
  if (iend < 8) throw new Error('not a PNG: IEND chunk not found');
  const type = Buffer.from('tEXt', 'latin1');
  const data = Buffer.concat([Buffer.from(key, 'latin1'), Buffer.from([0]), Buffer.from(text, 'latin1')]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([type, data])));
  const src = Buffer.from(png);
  return Buffer.concat([src.subarray(0, iend), length, type, data, crc, src.subarray(iend)]);
}

/** Reads every tEXt chunk as key/value pairs. */
export function readPngText(png: Uint8Array): Record<string, string> {
  const buf = Buffer.from(png);
  const out: Record<string, string> = {};
  for (let i = 8; i + 8 <= buf.length; ) {
    const length = buf.readUInt32BE(i);
    const type = buf.toString('latin1', i + 4, i + 8);
    if (type === 'tEXt') {
      const body = buf.subarray(i + 8, i + 8 + length);
      const zero = body.indexOf(0);
      out[body.toString('latin1', 0, zero)] = body.toString('latin1', zero + 1);
    }
    i += 12 + length;
  }
  return out;
}
