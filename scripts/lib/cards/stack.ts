/**
 * stack.svg: 1280x360. The two short lines of the site's About section
 * (what I ship with, the AI tools I use daily) as neon-tinted marks from
 * simple-icons (CC0) in a console-menu frame, each labeled. Every item in
 * each row is drawn, in the view's own order: where simple-icons has no
 * mark for it (AWS, Playwright MCP, Context7, claude-mem), it draws as a
 * text chip in the same neon-outlined style instead of an invented icon.
 * Chrome DevTools MCP draws with the Google Chrome mark and GitHub MCP with
 * the GitHub mark: they are those products' tools.
 */

import {
  siClaude,
  siDocker,
  siElectron,
  siGithub,
  siGooglechrome,
  siNextdotjs,
  siNodedotjs,
  siPostgresql,
  siPython,
  siReact,
  siRust,
  siSvelte,
  siTypescript,
  type SimpleIcon,
} from 'simple-icons';
import type { SiteView } from '../../../src/lib/view.ts';
import { at, svgDocument, textLayer } from './compose.ts';
import { SANS } from './fonts.ts';
import { chip, display, glowDefs, menuFrame, nightBandDefs, S, scanlineDefs, stars, T, text } from './pieces.ts';

export const STACK_WIDTH = 1280;
export const STACK_HEIGHT = 360;

export interface StackMark {
  label: string;
  icon: SimpleIcon;
}

/** Stack labels matched to a real simple-icons mark (AWS has none there: it draws as a chip). */
export const SHIP_MARKS: readonly StackMark[] = [
  { label: 'TypeScript', icon: siTypescript },
  { label: 'Node.js', icon: siNodedotjs },
  { label: 'Svelte', icon: siSvelte },
  { label: 'React', icon: siReact },
  { label: 'Next.js', icon: siNextdotjs },
  { label: 'PostgreSQL', icon: siPostgresql },
  { label: 'Python', icon: siPython },
  { label: 'Rust', icon: siRust },
  { label: 'Electron', icon: siElectron },
  { label: 'Docker', icon: siDocker },
];

/** AI-tool labels matched to a real simple-icons mark (Playwright MCP, Context7 and claude-mem draw as chips). */
export const TOOL_MARKS: readonly StackMark[] = [
  { label: 'Claude Code', icon: siClaude },
  { label: 'Chrome DevTools MCP', icon: siGooglechrome },
  { label: 'GitHub MCP', icon: siGithub },
];

const NEON = [S.neonPink, S.neonCyan, T.changed, T.mergedText, T.deprecated];

const markFor = (label: string): SimpleIcon | undefined => [...SHIP_MARKS, ...TOOL_MARKS].find((m) => m.label === label)?.icon;

export const stackTitle = (view: SiteView): string =>
  `${view.about.stack.label}: ${view.about.stack.items.join(', ')}. ${view.about.aiTools.label}: ${view.about.aiTools.items.join(', ')}.`;

const ICON = 46;
const X0 = 76;
const X1 = STACK_WIDTH - 76;

export async function stackCard(view: SiteView): Promise<string> {
  const W = STACK_WIDTH;
  const H = STACK_HEIGHT;
  const rows: { label: string; items: readonly string[]; y: number }[] = [
    { label: view.about.stack.label, items: view.about.stack.items, y: 88 },
    { label: view.about.aiTools.label, items: view.about.aiTools.items, y: 236 },
  ];

  let marks = '';
  const labels = [];
  for (const [r, row] of rows.entries()) {
    const slot = (X1 - X0) / row.items.length;
    labels.push(at(X0, row.y - 34, display(row.label.toUpperCase(), 24, T.brand)));
    for (const [i, label] of row.items.entries()) {
      const cx = X0 + slot * i + slot / 2;
      const color = NEON[(i + r * 2) % NEON.length]!;
      const icon = markFor(label);
      if (icon) {
        const k = ICON / 24;
        marks += `<g transform="translate(${Math.round((cx - ICON / 2) * 10) / 10} ${row.y + 10}) scale(${Math.round(k * 1000) / 1000})"><path d="${icon.path}" fill="${color}"/></g>`;
        labels.push(
          at(cx, row.y + ICON + 20, text({ fontFamily: SANS, fontWeight: 600, fontSize: 18, lineHeight: 1, color: T.ink, whiteSpace: 'pre' }, label), {
            transform: 'translateX(-50%)',
          }),
        );
      } else {
        labels.push(
          at(cx, row.y + 10 + ICON / 2, chip(label, color, { fontSize: 15, padX: 9, padY: 5 }), { transform: 'translate(-50%, -50%)' }),
        );
      }
    }
  }

  const layer = await textLayer(labels, { width: W, height: H, id: 'st' });
  const defs = nightBandDefs('st-night') + scanlineDefs('st-scan') + glowDefs('st-glow', W, H, 5);
  const body =
    `<rect width="${W}" height="${H}" fill="url(#st-night)"/>` +
    stars({ x: 0, y: 0, width: W, height: H, count: 40, seed: 2010 }) +
    menuFrame({ x: 24, y: 16, width: W - 48, height: H - 32, tilt: 6, fill: T.panel, edge: S.neonCyan }) +
    `<rect x="36" y="30" width="${W - 72}" height="${H - 60}" fill="url(#st-scan)"/>` +
    `<g filter="url(#st-glow)">${marks}</g>` +
    layer;
  return svgDocument({ width: W, height: H, title: stackTitle(view), defs, body });
}
