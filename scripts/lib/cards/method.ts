/**
 * method.svg: 1280 wide, as tall as the method needs. The README's
 * centerpiece, "How I work with AI": every step of view.aiWorkflow as a
 * numbered row in a console-menu frame (name, one line, the tools it runs
 * on), closed by the proof line (this profile was built that way).
 *
 * Body text is 24px so it still reads at GitHub's ~830px column (about
 * 15.5px on screen).
 */

import type { SiteView } from '../../../src/lib/view.ts';
import { flowLayer, svgDocument } from './compose.ts';
import { HUD, SANS, SCRIPT } from './fonts.ts';
import { bodyStyle, chip, display, flex, menuFrame, nightBandDefs, S, scanlineDefs, stars, T, text } from './pieces.ts';

export const METHOD_WIDTH = 1280;

const PAD = 36;
const INNER_X = 72;
const INNER_W = METHOD_WIDTH - INNER_X * 2;

/** The accessible title and README alt text of the method card. */
export function methodTitle(view: SiteView): string {
  const steps = view.aiWorkflow.items.map((s) => s.name).join(', ');
  return `${view.sections.ai.label}: ${steps}.`;
}

function step(item: SiteView['aiWorkflow']['items'][number], index: number, last: boolean) {
  const number = text(
    {
      fontFamily: HUD,
      fontWeight: 900,
      fontSize: 30,
      lineHeight: 1,
      color: T.brand,
      width: 64,
      flexShrink: 0,
      paddingTop: 2,
    },
    String(index + 1).padStart(2, '0'),
  );
  const head = flex(
    { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' },
    text({ fontFamily: SANS, fontWeight: 800, fontSize: 30, lineHeight: 1.15, color: T.ink }, item.name),
    flex({ flexDirection: 'row', gap: 8 }, ...item.tools.map((tool) => chip(tool, T.added, { fontSize: 18, padX: 10, padY: 4 }))),
  );
  const body = text({ ...bodyStyle(24, T.ink2), marginTop: 8 }, item.text);
  return flex(
    {
      flexDirection: 'row',
      paddingTop: 20,
      paddingBottom: 20,
      ...(last ? {} : { borderBottom: `1px solid ${T.rule}` }),
    },
    number,
    flex({ flexDirection: 'column', flexGrow: 1, flexShrink: 1 }, head, body),
  );
}

export async function methodCard(view: SiteView): Promise<string> {
  const { items } = view.aiWorkflow;

  const content = flex(
    { flexDirection: 'column', width: INNER_W },
    flex(
      { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
      display(view.sections.ai.label.toUpperCase(), 54),
      text({ fontFamily: SCRIPT, fontSize: 40, lineHeight: 1, color: T.brand, marginTop: 4 }, view.person.name.split(' ')[0]!),
    ),
    text({ ...bodyStyle(26, T.ink, 600), marginTop: 20, marginBottom: 6 }, view.sections.ai.claim),
    ...items.map((item, i) => step(item, i, i === items.length - 1)),
    flex(
      { flexDirection: 'row', alignItems: 'center', gap: 14, marginTop: 18, padding: '16px 20px', backgroundColor: T.night, borderRadius: 8 },
      text({ fontFamily: HUD, fontWeight: 900, fontSize: 20, color: T.changed, flexShrink: 0 }, 'PROOF'),
      text({ ...bodyStyle(22, T.ink), flexShrink: 1 }, view.aiWorkflow.builtWith),
    ),
  );

  const layer = await flowLayer(content, { width: INNER_W, id: 'm' });
  const top = PAD + 44;
  const height = top + layer.height + 44 + PAD;

  const defs = nightBandDefs('m-night') + scanlineDefs('m-scan');
  const body =
    `<rect width="${METHOD_WIDTH}" height="${height}" fill="url(#m-night)"/>` +
    stars({ x: 0, y: 0, width: METHOD_WIDTH, height, count: 70, seed: 1986 }) +
    menuFrame({ x: PAD, y: PAD, width: METHOD_WIDTH - PAD * 2, height: height - PAD * 2, tilt: 8, fill: T.panel, edge: S.neonPink }) +
    `<rect x="${PAD + 12}" y="${PAD + 14}" width="${METHOD_WIDTH - PAD * 2 - 24}" height="${height - PAD * 2 - 28}" fill="url(#m-scan)"/>` +
    `<g transform="translate(${INNER_X} ${top})">${layer.markup}</g>`;

  return await svgDocument({ width: METHOD_WIDTH, height, title: methodTitle(view), defs, body });
}
