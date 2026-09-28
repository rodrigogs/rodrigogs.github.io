/**
 * Post-processing on the raw satori SVG string: an accessible name.
 *
 * Satori renders glyphs to `<path>` data, so screen readers get nothing from
 * the SVG's contents; a `<title>` plus `role="img" aria-label` is added by
 * string surgery, which is simpler and more reliable than trying to route an
 * ARIA tree through satori's layout engine.
 */

const escapeXml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

/**
 * Rounds every decimal number in the SVG (glyph path coordinates, mostly)
 * to the nearest integer. Satori's embedded-glyph output carries far more
 * sub-pixel precision than a card rendered at 300-1280px, or scaled again
 * to 49% in a README, can ever show; this halves typical file size with no
 * visible change. Must run before `withAccessibleTitle`, since that adds
 * the only human-readable numbers in the document (versions, dates) and
 * those must not be touched.
 */
export function roundNumbers(svg: string): string {
  return svg.replace(/-?\d+\.\d+/g, (m) => String(Math.round(Number(m))));
}

/** Adds `role="img" aria-label="…"` on the root <svg> and a matching <title> as its first child. */
export function withAccessibleTitle(svg: string, title: string): string {
  const esc = escapeXml(title.trim());
  const withAttrs = svg.replace(/^<svg /, `<svg role="img" aria-label="${esc}" `);
  return withAttrs.replace(/(^<svg[^>]*>)/, `$1<title>${esc}</title>`);
}
