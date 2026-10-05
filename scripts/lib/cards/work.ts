/**
 * work-<id>.svg: 840x300, one console-menu frame per project: the night
 * band, a thick dark-bordered panel with a neon edge and scanlines (the
 * site's own frame, as on the site's work grid), and inside it the
 * project name as an outlined title, its one-line note, its two strongest
 * proofs as HUD numerals, and what it is made of. The sunset stays in the
 * header: below it the README is night and menu frames, never a second
 * scene. Shown two per row in the README (about 410px wide), so nothing
 * is under 22px.
 */

import type { EntryView } from '../../../src/lib/view.ts';
import { at, svgDocument, textLayer } from './compose.ts';
import { HUD } from './fonts.ts';
import { bodyStyle, display, flex, menuFrame, nightBandDefs, S, scanlineDefs, stars, T, text } from './pieces.ts';

export const WORK_WIDTH = 840;
export const WORK_HEIGHT = 300;

const PROOF_COLORS = [S.neonCyan, T.changed];

export const workTitle = (entry: EntryView): string => `${entry.name}: ${entry.note}`;

/** A stable per-entry seed, so every card gets its own fixed stars. */
const seedFor = (id: string): number => [...id].reduce((a, c) => a + c.charCodeAt(0), 1000);

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

export async function workCard(entry: EntryView): Promise<string> {
  const W = WORK_WIDTH;
  const H = WORK_HEIGHT;
  const X = 36;
  const colW = W - 2 * X - 16;
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
      at(X, 34, display(entry.name.toUpperCase(), 50)),
      at(
        X,
        100,
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
      at(X, 202, flex({ flexDirection: 'row', gap: 26 }, ...proofs)),
      at(
        X,
        248,
        text({ ...bodyStyle(22, T.ink2, 600), lineHeight: 1, whiteSpace: 'pre' }, entry.stack.join(' · ')),
      ),
    ],
    { width: W, height: H, id: `${id}-t` },
  );

  const defs = nightBandDefs(`${id}-night`) + scanlineDefs(`${id}-scan`);
  const body =
    `<rect width="${W}" height="${H}" fill="url(#${id}-night)"/>` +
    stars({ x: 0, y: 0, width: W, height: H, count: 12, seed: seedFor(entry.id) }) +
    menuFrame({ x: 14, y: 10, width: W - 28, height: H - 20, tilt: 5, fill: T.panel, edge: S.neonCyan }) +
    `<rect x="26" y="22" width="${W - 52}" height="${H - 44}" fill="url(#${id}-scan)"/>` +
    layer;

  return svgDocument({
    width: W,
    height: H,
    title: workTitle(entry),
    defs,
    body,
  });
}
