import { crc32 } from 'node:zlib';
import { Resvg } from '@resvg/resvg-js';
import { describe, expect, it } from 'vitest';
import { OG_PROVENANCE, PROVENANCE_KEY, readPngText, withPngText } from './png.ts';

const tiny = new Resvg('<svg xmlns="http://www.w3.org/2000/svg" width="4" height="4"><rect width="4" height="4" fill="#127543"/></svg>')
  .render()
  .asPng();

describe('withPngText', () => {
  it('embeds a readable tEXt chunk and keeps the image decodable', () => {
    const out = withPngText(tiny, PROVENANCE_KEY, OG_PROVENANCE);
    expect(readPngText(out)[PROVENANCE_KEY]).toBe(OG_PROVENANCE);
    expect(out.subarray(out.length - 8, out.length - 4).toString('latin1')).toBe('IEND');
    expect(out.length).toBe(tiny.length + 12 + PROVENANCE_KEY.length + 1 + OG_PROVENANCE.length);
  });

  it('writes a valid chunk CRC', () => {
    const out = withPngText(tiny, 'k', 'v');
    const at = out.indexOf(Buffer.from('tEXt', 'latin1'));
    const body = out.subarray(at, at + 4 + 3);
    expect(out.readUInt32BE(at + 7)).toBe(crc32(body));
  });

  it('rejects non-PNG input', () => {
    expect(() => withPngText(new Uint8Array([1, 2, 3]), 'k', 'v')).toThrow(/not a PNG/);
  });

});
