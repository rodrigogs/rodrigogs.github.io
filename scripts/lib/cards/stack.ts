/**
 * stack.svg: 1280x360. A curated strip of the technologies I ship with
 * and the AI and quality tools I work with, as neon-tinted marks from
 * simple-icons (CC0) in a console-menu frame, each labeled. Only marks
 * that exist in the installed simple-icons are used (SvelteKit, AWS,
 * OpenAI and Playwright have none there, so they are left to the text
 * list under the card rather than drawn with an invented mark).
 */

import {
  siBiome,
  siClaude,
  siDocker,
  siElectron,
  siGithubactions,
  siLangchain,
  siNextdotjs,
  siNodedotjs,
  siOllama,
  siPostgresql,
  siPython,
  siReact,
  siRust,
  siSvelte,
  siTelegram,
  siTypescript,
  siVitest,
  siWebgpu,
  type SimpleIcon,
} from 'simple-icons';
import type { SiteView } from '../../../src/lib/view.ts';
import { at, svgDocument, textLayer } from './compose.ts';
import { SANS } from './fonts.ts';
import { display, glowDefs, menuFrame, nightBandDefs, S, scanlineDefs, stars, T, text } from './pieces.ts';

export const STACK_WIDTH = 1280;
export const STACK_HEIGHT = 360;

export interface StackMark {
  label: string;
  icon: SimpleIcon;
}

/** What I ship with: the view's `ships` list, in its order, where a mark exists. */
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

/** The AI and quality tools from the view's stack groups and method. */
export const TOOL_MARKS: readonly StackMark[] = [
  { label: 'Claude', icon: siClaude },
  { label: 'Ollama', icon: siOllama },
  { label: 'LangChain', icon: siLangchain },
  { label: 'WebGPU', icon: siWebgpu },
  { label: 'GitHub Actions', icon: siGithubactions },
  { label: 'Vitest', icon: siVitest },
  { label: 'Biome', icon: siBiome },
  { label: 'Telegram', icon: siTelegram },
];

const NEON = [S.neonPink, S.neonCyan, T.changed, T.mergedText, T.deprecated];

export const stackTitle = (): string =>
  `Stack. Ships with ${SHIP_MARKS.map((m) => m.label).join(', ')}. AI and tooling: ${TOOL_MARKS.map((m) => m.label).join(', ')}.`;

const ICON = 46;
const X0 = 76;
const X1 = STACK_WIDTH - 76;

export async function stackCard(view: SiteView): Promise<string> {
  const W = STACK_WIDTH;
  const H = STACK_HEIGHT;
  const rows = [
    { label: view.stack.ships.label, marks: SHIP_MARKS, y: 88 },
    { label: 'AI and tooling', marks: TOOL_MARKS, y: 236 },
  ];

  let marks = '';
  const labels = [];
  for (const [r, row] of rows.entries()) {
    const slot = (X1 - X0) / row.marks.length;
    labels.push(at(X0, row.y - 34, display(row.label.toUpperCase(), 24, T.brand)));
    for (const [i, m] of row.marks.entries()) {
      const cx = X0 + slot * i + slot / 2;
      const color = NEON[(i + r * 2) % NEON.length]!;
      const k = ICON / 24;
      marks += `<g transform="translate(${Math.round((cx - ICON / 2) * 10) / 10} ${row.y + 10}) scale(${Math.round(k * 1000) / 1000})"><path d="${m.icon.path}" fill="${color}"/></g>`;
      labels.push(
        at(cx, row.y + ICON + 20, text({ fontFamily: SANS, fontWeight: 600, fontSize: 18, lineHeight: 1, color: T.ink, whiteSpace: 'pre' }, m.label), {
          transform: 'translateX(-50%)',
        }),
      );
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
  return svgDocument({ width: W, height: H, title: stackTitle(), defs, body });
}
