/**
 * hud.svg: 1280x220. A HUD strip in our own design over the night-drive
 * scene: real numbers from the view as an icon plus an outlined Orbitron
 * numeral on the dark water, with no panel behind them, and the start
 * year as the readout in the corner of the sky. The sun's reflection runs
 * in the gap between the two clusters.
 */

import { sceneGeometry, sceneSvg } from '../../../src/design/scene-svg.ts';
import type { SiteView } from '../../../src/lib/view.ts';
import { at, embedSvg, svgDocument, textLayer } from './compose.ts';
import { type HudIcon, hudIcon } from './icons.ts';
import { SANS } from './fonts.ts';
import { hud, S, T, text } from './pieces.ts';

export const HUD_WIDTH = 1280;
export const HUD_HEIGHT = 220;

/** Sun position: its reflection falls between the third and fourth readout. */
const SUN_X = 0.66;

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
    { icon: 'download', value: view.totals.monthlyDownloads, label: 'npm downloads / 30 days', color: T.select },
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
  const geo = sceneGeometry(W, H, SUN_X);
  const stats = hudStats(view);
  const leftCount = Math.min(3, stats.length);
  const left = { from: 40, to: geo.sun.cx - geo.sun.r - 24 };
  const right = { from: geo.sun.cx + geo.sun.r + 36, to: W - 24 };
  // The readouts sit on the dark water, below the horizon, where they keep their contrast.
  const ROW = Math.round(geo.horizon + 12);
  const ICON = 36;

  const slots = stats.map((s, i) => {
    const onLeft = i < leftCount;
    const band = onLeft ? left : right;
    const n = onLeft ? leftCount : stats.length - leftCount;
    const k = onLeft ? i : i - leftCount;
    return { ...s, x: Math.round(band.from + ((band.to - band.from) / n) * k) };
  });

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

  const body =
    embedSvg(sceneSvg({ width: W, height: H, palms: false, sunX: SUN_X, idPrefix: 'hd-' })) +
    slots.map((s) => hudIcon(s.icon, s.x, ROW, ICON, s.color)).join('') +
    layer;

  return svgDocument({ width: W, height: H, title: hudTitle(view), body });
}
