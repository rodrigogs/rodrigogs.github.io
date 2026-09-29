/**
 * work-<id>.svg: 840x300, a "loading screen" per project: the sunset,
 * the sun and the palms on the right, and on a left scrim the project
 * name as an outlined title, its one-line note, its two strongest proofs
 * as HUD numerals, and a plate with its status and first year. Shown two
 * per row in the README (about 410px wide), so nothing is under 22px.
 */

import { sceneGeometry, sceneSvg } from '../../../src/design/scene-svg.ts';
import type { EntryView } from '../../../src/lib/view.ts';
import { at, embedSvg, svgDocument, textLayer } from './compose.ts';
import { HUD } from './fonts.ts';
import { bodyStyle, display, flex, rolePlate, S, scrimDefs, T, text } from './pieces.ts';

export const WORK_WIDTH = 840;
export const WORK_HEIGHT = 300;

const SUN_X = 0.8;
const PROOF_COLORS = [S.neonCyan, T.changed];

export const workTitle = (entry: EntryView): string => `${entry.name}: ${entry.note}`;

/** The two proofs shown on the card: at most two, and short enough for one line. */
export function workProofs(entry: EntryView): { value: string; label: string }[] {
  const out: { value: string; label: string }[] = [];
  let chars = 0;
  for (const p of entry.proofs) {
    const len = p.value.length + p.label.length + 4;
    if (out.length >= 2 || (out.length > 0 && chars + len > 40)) break;
    out.push({ value: p.value, label: p.label });
    chars += len;
  }
  return out;
}

export async function workCard(entry: EntryView, sinceLabel: string): Promise<string> {
  const W = WORK_WIDTH;
  const H = WORK_HEIGHT;
  const geo = sceneGeometry(W, H, SUN_X);
  const X = 32;
  const colW = Math.round(geo.sun.cx - geo.sun.r - 28 - X);
  const id = `w-${entry.id}`;

  const proofs = workProofs(entry).map((p, i) =>
    flex(
      { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
      text({ fontFamily: HUD, fontWeight: 900, fontSize: 30, lineHeight: 1, color: PROOF_COLORS[i % PROOF_COLORS.length], whiteSpace: 'pre' }, p.value),
      text({ ...bodyStyle(22, T.ink, 600), lineHeight: 1, whiteSpace: 'pre', paddingBottom: 1 }, p.label),
    ),
  );

  const layer = await textLayer(
    [
      at(X, 22, display(entry.name.toUpperCase(), 50)),
      at(
        X,
        88,
        text(
          {
            ...bodyStyle(26, T.ink, 400),
            lineHeight: 1.3,
            width: colW,
            display: '-webkit-box',
            WebkitBoxOrient: 'vertical',
            WebkitLineClamp: 3,
            textOverflow: 'ellipsis',
            overflow: 'hidden',
          },
          entry.note,
        ),
      ),
      at(X, 196, flex({ flexDirection: 'row', gap: 26 }, ...proofs)),
      at(
        X,
        244,
        flex(
          { flexDirection: 'row', alignItems: 'center', gap: 14 },
          rolePlate(entry.statusRole, entry.statusLabel, { fontSize: 20, padX: 12, padY: 6, weight: 800 }),
          text({ fontFamily: HUD, fontWeight: 700, fontSize: 22, lineHeight: 1, color: T.ink2, whiteSpace: 'pre' }, `${sinceLabel.toUpperCase()} ${entry.born}`),
          entry.latest ? text({ ...bodyStyle(22, T.ink3, 600), lineHeight: 1, whiteSpace: 'pre' }, entry.latest.tag) : null,
        ),
      ),
    ],
    { width: W, height: H, id: `${id}-t` },
  );

  const body =
    embedSvg(sceneSvg({ width: W, height: H, skyline: false, sunX: SUN_X, idPrefix: `${id}-s-` })) +
    `<rect width="${Math.round(colW + X + 110)}" height="${H}" fill="url(#${id}-scrim)"/>`;

  return svgDocument({
    width: W,
    height: H,
    title: workTitle(entry),
    defs: scrimDefs(`${id}-scrim`, 0.92),
    body: body + layer,
  });
}
