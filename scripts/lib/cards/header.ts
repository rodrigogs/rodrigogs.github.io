/**
 * header.svg: 1280x420, animated. The README masthead: the night-drive
 * scene (src/design/scene-svg.ts, SMIL so it plays inside GitHub's <img>)
 * with the signature lockup, the role line and the site plate on a left
 * scrim, and the place paired with its time zone as a HUD readout in the
 * top-right sky (never alone: a bare UTC offset means nothing without the
 * place it is relative to). The sun sits at 68% x, clear of every word.
 */

import { sceneGeometry, sceneSvg } from '../../../src/design/scene-svg.ts';
import type { SiteView } from '../../../src/lib/view.ts';
import { at, embedSvg, svgDocument, textLayer } from './compose.ts';
import { bodyStyle, flex, glowDefs, hud, lockup, scrimDefs, sitePlate, T, text } from './pieces.ts';

export const HEADER_WIDTH = 1280;
export const HEADER_HEIGHT = 420;

export const headerTitle = (view: SiteView): string => `${view.person.name}. ${view.hero.title}`;

export async function headerCard(view: SiteView): Promise<string> {
  const W = HEADER_WIDTH;
  const H = HEADER_HEIGHT;
  const geo = sceneGeometry(W, H);
  const textRight = geo.sun.cx - geo.sun.r - 40;
  const { script, surname } = lockup(view.person.name);
  const X = 56;

  const scriptLayer = await textLayer([at(X - 6, 18, script)], { width: W, height: H, id: 'hs' });
  const mainLayer = await textLayer(
    [
      at(X, 150, surname),
      at(X, 244, text({ ...bodyStyle(26, T.ink, 600), width: textRight - X }, view.hero.title)),
      at(X, 334, sitePlate(view.person.site)),
      at(
        W - 40,
        24,
        flex(
          { flexDirection: 'row', alignItems: 'center', gap: 10 },
          text({ ...bodyStyle(20, T.ink2, 600), whiteSpace: 'pre' }, view.person.location),
          text({ ...bodyStyle(20, T.ink2, 600), whiteSpace: 'pre' }, '·'),
          hud(view.person.timezone, 26, T.added),
        ),
        { transform: 'translateX(-100%)' },
      ),
    ],
    { width: W, height: H, id: 'ht' },
  );

  const defs = glowDefs('h-glow', W, H, 7) + scrimDefs('h-scrim');
  const body =
    embedSvg(sceneSvg({ width: W, height: H, animated: true, idPrefix: 'hs-' })) +
    `<rect width="${Math.round(textRight + 60)}" height="${H}" fill="url(#h-scrim)"/>` +
    `<g filter="url(#h-glow)">${scriptLayer}` +
    `<animate attributeName="opacity" values="1;0.86;1;1;0.93;1" keyTimes="0;0.04;0.08;0.6;0.63;1" dur="7s" repeatCount="indefinite"/></g>` +
    mainLayer;

  return svgDocument({ width: W, height: H, title: headerTitle(view), defs, body });
}
