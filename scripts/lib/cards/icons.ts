/**
 * Our own HUD glyphs, drawn on a 32x32 grid (no third-party icon art):
 * each is a filled shape with the HUD's dark outline, like the numerals
 * beside it.
 */

import { S } from './pieces.ts';

export type HudIcon = 'star' | 'download' | 'calendar' | 'person' | 'tag';

const shapes: Record<HudIcon, string> = {
  star: '<path d="M16 2l4.2 8.8 9.6 1.2-7 6.6 1.8 9.5L16 23.4l-8.6 4.7 1.8-9.5-7-6.6 9.6-1.2z"/>',
  download: '<path d="M12 3h8v10h6l-10 10L6 13h6z"/><path d="M3 25h26v5H3z"/>',
  calendar:
    '<path d="M3 3h7v7H3zM12.5 3h7v7h-7zM22 3h7v7h-7zM3 12.5h7v7H3zM12.5 12.5h7v7h-7zM22 12.5h7v7h-7zM3 22h7v7H3zM12.5 22h7v7h-7z"/>',
  person: '<circle cx="16" cy="9" r="6.5"/><path d="M3 30c0-7.5 5.8-12.5 13-12.5S29 22.5 29 30z"/>',
  tag: '<path fill-rule="evenodd" d="M3 3h12.5L29.5 17 17 29.5 3 15.5zM9.5 7a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5z"/>',
};

/** One HUD glyph at (x, y), `size` px square, filled with `color` and outlined in the silhouette color. */
export function hudIcon(icon: HudIcon, x: number, y: number, size: number, color: string): string {
  const k = size / 32;
  return (
    `<g transform="translate(${x} ${y}) scale(${Math.round(k * 1000) / 1000})" fill="${color}" stroke="${S.silhouette}" stroke-width="${Math.round((3 / k) * 10) / 10}" stroke-linejoin="round" paint-order="stroke">` +
    shapes[icon] +
    '</g>'
  );
}
