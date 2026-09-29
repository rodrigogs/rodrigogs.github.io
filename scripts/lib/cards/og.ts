/**
 * og/{en,pt}.png: the 1200x630 social preview, rasterized by resvg. The
 * static poster of the night-drive scene with the signature lockup, the
 * role line and the site plate on a left scrim, so a shared link looks
 * like the site's first viewport. Text is drawn as glyph outlines here
 * (resvg reads no @font-face).
 */

import { sceneGeometry, sceneSvg } from '../../../src/design/scene-svg.ts';
import type { SiteView } from '../../../src/lib/view.ts';
import { at, embedSvg, svgDocument, textLayer } from './compose.ts';
import { bodyStyle, flex, glowDefs, lockup, scrimDefs, sitePlate, T, text } from './pieces.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

export async function ogCard(view: SiteView): Promise<string> {
  const W = OG_WIDTH;
  const H = OG_HEIGHT;
  const geo = sceneGeometry(W, H);
  const textRight = geo.sun.cx - geo.sun.r - 36;
  const { script, surname } = lockup(view.person.name, 1.22);
  const X = 64;

  const scriptLayer = await textLayer([at(X - 8, 58, script)], { width: W, height: H, id: 'os', glyphs: true });
  const mainLayer = await textLayer(
    [
      at(X, 236, surname),
      at(
        X,
        350,
        flex(
          { flexDirection: 'column', alignItems: 'flex-start', gap: 26, width: textRight - X },
          text({ ...bodyStyle(30, T.ink, 600), lineHeight: 1.3 }, view.hero.title),
          sitePlate(view.person.site, 26),
        ),
      ),
    ],
    { width: W, height: H, id: 'ot', glyphs: true },
  );

  const defs = glowDefs('oc-glow', W, H, 9) + scrimDefs('oc-scrim');
  const body =
    embedSvg(sceneSvg({ width: W, height: H, idPrefix: 'os-' })) +
    `<rect width="${Math.round(textRight + 80)}" height="${H}" fill="url(#oc-scrim)"/>` +
    `<g filter="url(#oc-glow)">${scriptLayer}</g>` +
    mainLayer;

  return svgDocument({ width: W, height: H, title: `${view.person.name}. ${view.hero.title}`, defs, body });
}
