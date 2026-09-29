/**
 * skyline.svg: 1280x300. Contribution art: the last 53 weeks of the
 * GitHub contribution calendar drawn as an Art Deco skyline on the
 * water, one building per week. Heights are linear from zero against a
 * labeled scale, so the skyline is a real chart: the year's total and the
 * busiest week are named, and the first and last week are dated.
 */

import { sceneSvg } from '../../../src/design/scene-svg.ts';
import type { ContributionYearView, SiteView } from '../../../src/lib/view.ts';
import { at, embedSvg, svgDocument, textLayer } from './compose.ts';
import { HUD, SANS } from './fonts.ts';
import { bodyStyle, display, flex, prng, S, T, text } from './pieces.ts';

export const SKYLINE_WIDTH = 1280;
export const SKYLINE_HEIGHT = 300;

const W = SKYLINE_WIDTH;
const H = SKYLINE_HEIGHT;
/** The water line: buildings stand on it (matches the scene's horizon). */
const BASE = Math.round(H * S.horizonAt);
/** Top of the scale (the axis maximum). */
const TOP = 72;
const X0 = 88;
const X1 = W - 40;

/** The smallest round axis maximum at or above `max`, with at most three gridlines. */
export function axisFor(max: number): { top: number; step: number } {
  const steps = [5, 10, 20, 25, 50, 100, 200, 250, 500, 1000, 2000, 2500, 5000, 10_000];
  const step = steps.find((s) => Math.ceil(max / s) <= 3) ?? Math.ceil(max / 3);
  return { top: Math.max(step, Math.ceil(max / step) * step), step };
}

/** Pixel height of a week's building: linear from zero, `axisTop` maps to the full chart height. */
export function buildingHeight(count: number, axisTop: number): number {
  return axisTop > 0 ? ((BASE - TOP) * count) / axisTop : 0;
}

const r1 = (n: number) => Math.round(n * 10) / 10;

function monthYear(iso: string): string {
  return new Intl.DateTimeFormat('en', { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${iso}T00:00:00Z`));
}

export function skylineTitle(year: ContributionYearView | null): string {
  if (!year) return 'Contributions over the last year: data unavailable on the last build.';
  const best = year.best ? `, the busiest week ${year.best.count} (week of ${year.best.weekOf})` : '';
  return `Contributions over the last ${year.weeks.length} weeks, drawn as a skyline: ${year.total} in total${best}.`;
}

function building(x: number, w: number, h: number, i: number, best: boolean, rand: () => number): string {
  if (h <= 0) return '';
  const top = r1(BASE - h);
  const edge = best ? S.neonCyan : i % 3 === 0 ? S.neonCyan : S.neonPink;
  let out = '';
  // Art Deco crown: a stepped top whose highest point is exactly the value.
  if (h >= 22) {
    const step = Math.min(8, h / 5);
    out += `<path d="M${r1(x)} ${BASE}V${r1(top + step)}H${r1(x + 3)}V${top}H${r1(x + w - 3)}V${r1(top + step)}H${r1(x + w)}V${BASE}Z" fill="${S.silhouette}"/>`;
    out += `<path d="M${r1(x)} ${BASE}V${r1(top + step)}H${r1(x + 3)}V${top}H${r1(x + w - 3)}V${r1(top + step)}H${r1(x + w)}V${BASE}" fill="none" stroke="${edge}" stroke-width="${best ? 2 : 1.4}" stroke-linejoin="round"/>`;
  } else {
    out += `<rect x="${r1(x)}" y="${top}" width="${w}" height="${r1(h)}" fill="${S.silhouette}"/>`;
    if (h >= 3) out += `<path d="M${r1(x)} ${BASE}V${top}H${r1(x + w)}V${BASE}" fill="none" stroke="${edge}" stroke-width="1.2"/>`;
  }
  // Band windows, lit at random (seeded), from under the crown down.
  for (let y = top + (h >= 22 ? 12 : 5); y < BASE - 4; y += 7) {
    for (const wx of [x + 3.5, x + w / 2 + 1]) {
      if (rand() < 0.5) continue;
      const lit = rand();
      const color = lit < 0.7 ? T.changed : lit < 0.85 ? S.neonPink : S.neonCyan;
      out += `<rect x="${r1(wx)}" y="${r1(y)}" width="${r1(w / 2 - 4.5)}" height="2.4" fill="${color}" opacity="0.85"/>`;
    }
  }
  return out;
}

export async function skylineCard(view: SiteView): Promise<string> {
  const year = view.contributionYear;
  const defs =
    '<pattern id="sk-ripple" width="8" height="5" patternUnits="userSpaceOnUse"><rect width="8" height="3" fill="#fff"/></pattern>' +
    `<mask id="sk-reflect"><rect x="0" y="${BASE}" width="${W}" height="${H - BASE}" fill="url(#sk-ripple)"/></mask>` +
    `<linearGradient id="sk-fade" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${T.night}" stop-opacity="0.62"/><stop offset="1" stop-color="${T.night}" stop-opacity="0.12"/></linearGradient>`;
  const scene = embedSvg(sceneSvg({ width: W, height: H, animated: true, palms: false, skyline: false, sunX: 0.36, idPrefix: 'sks-' }));
  // A veil over the sky so the chart and its labels, not the sunset, lead.
  const veil = `<rect width="${W}" height="${BASE}" fill="url(#sk-fade)"/>`;

  if (!year) {
    const note = await textLayer(
      [at(0, 110, text({ ...bodyStyle(26, T.ink, 600), width: W, textAlign: 'center' }, 'Contribution data was unavailable on the last build.'))],
      { width: W, height: H, id: 'skt' },
    );
    return svgDocument({ width: W, height: H, title: skylineTitle(null), defs, body: scene + veil + note });
  }

  const n = year.weeks.length;
  const pitch = (X1 - X0) / n;
  const bw = Math.max(4, Math.round(pitch * 0.72));
  const axis = axisFor(Math.max(...year.weeks));
  const rand = prng(53);

  let city = '';
  const gridY: { y: number; value: number }[] = [];
  for (let v = axis.step; v <= axis.top; v += axis.step) gridY.push({ y: r1(BASE - buildingHeight(v, axis.top)), value: v });
  const grid = gridY
    .map((g) => `<path d="M${X0 - 6} ${g.y}H${X1}" stroke="${T.ink3}" stroke-width="1" stroke-dasharray="3 6" opacity="0.55"/>`)
    .join('');

  year.weeks.forEach((count, i) => {
    const x = X0 + i * pitch + (pitch - bw) / 2;
    city += building(x, bw, buildingHeight(count, axis.top), i, year.best?.index === i, rand);
  });

  const bestX = year.best ? X0 + year.best.index * pitch + pitch / 2 : 0;
  const bestTop = year.best ? BASE - buildingHeight(year.best.countRaw, axis.top) : 0;
  const leader = year.best
    ? `<path d="M${r1(bestX)} ${r1(bestTop - 6)}V${58}" stroke="${S.neonCyan}" stroke-width="2"/><circle cx="${r1(bestX)}" cy="${r1(bestTop - 6)}" r="3" fill="${S.neonCyan}"/>`
    : '';

  const fmt = new Intl.NumberFormat('en-US');
  const scaleStyle = { fontFamily: HUD, fontWeight: 700, fontSize: 14, lineHeight: 1, color: T.ink3, whiteSpace: 'pre' };
  const dateStyle = { fontFamily: SANS, fontWeight: 600, fontSize: 18, lineHeight: 1, color: T.ink3, whiteSpace: 'pre' };

  const layer = await textLayer(
    [
      at(
        40,
        18,
        flex(
          { flexDirection: 'row', alignItems: 'flex-end', gap: 14 },
          display(year.total, 40),
          text({ ...bodyStyle(22, T.ink, 600), paddingBottom: 4 }, 'contributions in the last year'),
        ),
      ),
      ...(year.best
        ? [
            at(
              bestX - 14,
              22,
              flex(
                { flexDirection: 'row', alignItems: 'flex-end', gap: 10 },
                text({ ...bodyStyle(20, T.ink2, 600), paddingBottom: 2 }, `Best week, ${year.best.weekOf}`),
                text({ fontFamily: HUD, fontWeight: 900, fontSize: 28, lineHeight: 1, color: S.neonCyan, whiteSpace: 'pre' }, year.best.count),
              ),
              { transform: 'translateX(-100%)' },
            ),
          ]
        : []),
      ...gridY.map((g) => at(X0 - 12, g.y - 7, text(scaleStyle, fmt.format(g.value)), { transform: 'translateX(-100%)' })),
      at(X0, H - 34, text(dateStyle, monthYear(year.weekStarts[0]!))),
      at(X1, H - 34, text(dateStyle, monthYear(year.weekStarts[n - 1]!)), { transform: 'translateX(-100%)' }),
    ],
    { width: W, height: H, id: 'skt' },
  );

  const reflection = `<g mask="url(#sk-reflect)" opacity="0.3"><g transform="translate(0 ${2 * BASE}) scale(1 -1)">${city}</g></g>`;
  const body = scene + veil + grid + reflection + city + leader + layer;
  return svgDocument({ width: W, height: H, title: skylineTitle(year), defs, body });
}
