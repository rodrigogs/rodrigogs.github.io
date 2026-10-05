/**
 * hud.svg: 1280x220. A HUD strip in our own design over the quiet night:
 * real numbers from the view as an icon plus an outlined Orbitron numeral,
 * with no panel behind them, and the start year as the readout in the
 * corner. The sunset stays in the header; here the readouts float on the
 * night band, as the HUD does over every section below the hero.
 */

import type { SiteView } from '../../../src/lib/view.ts';
import { at, svgDocument, textLayer } from './compose.ts';
import { type HudIcon, hudIcon } from './icons.ts';
import { SANS } from './fonts.ts';
import { hud, nightBandDefs, S, stars, T, text } from './pieces.ts';

export const HUD_WIDTH = 1280;
export const HUD_HEIGHT = 220;

/** The row sits a little below the card's middle, where a readout breathes. */
const ROW = 106;
const ICON = 36;

export interface HudStat {
  icon: HudIcon;
  value: string;
  label: string;
  color: string;
}

/** The readouts, in order; contributions drop out when the calendar was unavailable. */
export function hudStats(view: SiteView): HudStat[] {
  const stats: (HudStat | null)[] = [
    { icon: 'star', value: view.totals.stars, label: 'GitHub stars', color: T.brand },
    // The total folds in crates.io, not just npm; sun yellow, since green here means "selected".
    { icon: 'download', value: view.totals.monthlyDownloads, label: 'downloads / 30 days', color: T.changed },
    view.totals.contributions
      ? { icon: 'calendar', value: view.totals.contributions, label: 'contributions / year', color: T.added }
      : null,
    { icon: 'person', value: view.totals.followers, label: 'followers', color: T.ink2 },
    { icon: 'tag', value: view.totals.releases, label: 'releases shipped', color: T.changed },
  ];
  return stats.filter((s): s is HudStat => s !== null);
}

export const hudTitle = (view: SiteView): string =>
  `${hudStats(view)
    .map((s) => `${s.value} ${s.label}`)
    .join(', ')}. Shipping software since ${view.person.since}.`;

const labelStyle = {
  fontFamily: SANS,
  fontWeight: 800,
  fontSize: 18,
  lineHeight: 1,
  color: T.ink,
  WebkitTextStroke: `4px ${S.silhouette}`,
  whiteSpace: 'pre',
};

export async function hudCard(view: SiteView): Promise<string> {
  const W = HUD_WIDTH;
  const H = HUD_HEIGHT;
  const stats = hudStats(view);
  const slots = stats.map((s, i) => ({
    ...s,
    x: Math.round(40 + ((W - 80) / stats.length) * i),
  }));

  const layer = await textLayer(
    [
      ...slots.flatMap((s) => [
        at(s.x + ICON + 12, ROW - 2, hud(s.value, 40, s.color)),
        at(s.x, ROW + 46, text(labelStyle, s.label)),
      ]),
      at(W - 40, 20, hud(`SINCE ${view.person.since}`, 28, T.added), { transform: 'translateX(-100%)' }),
    ],
    { width: W, height: H, id: 'ht' },
  );

  const defs = nightBandDefs('hd-night');
  const body =
    `<rect width="${W}" height="${H}" fill="url(#hd-night)"/>` +
    stars({ x: 0, y: 0, width: W, height: H, count: 26, seed: 1986 }) +
    slots.map((s) => hudIcon(s.icon, s.x, ROW, ICON, s.color)).join('') +
    layer;

  return svgDocument({ width: W, height: H, title: hudTitle(view), body, defs });
}
