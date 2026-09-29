/**
 * Renders the GitHub profile README cards and the site's Open Graph PNGs
 * from the exact same view model the site pages consume
 * (src/lib/view.ts), so the README, the OG previews and the site can never
 * show different numbers or different words.
 *
 * One night variant per card: the art carries its own background, so it
 * reads the same on GitHub's light and dark themes.
 *
 * Run as the last step of `npm run build` (after `astro build`, so dist/
 * already exists) or directly with `npm run cards`. `CARDS_OUT_DIR`
 * renders somewhere else (default: dist), e.g. for a preview that must not
 * race a running `astro build`.
 */

import { Resvg } from '@resvg/resvg-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { Snapshot } from '../src/data/schema.ts';
import { buildView, type SiteView } from '../src/lib/view.ts';
import { FONT_FILES } from './lib/cards/fonts.ts';
import { headerCard } from './lib/cards/header.ts';
import { hudCard } from './lib/cards/hud.ts';
import { methodCard } from './lib/cards/method.ts';
import { ogCard, OG_HEIGHT, OG_WIDTH } from './lib/cards/og.ts';
import { OG_PROVENANCE, PROVENANCE_KEY, withPngText } from './lib/cards/png.ts';
import { renderReadme, WORK_IDS } from './lib/cards/readme.ts';
import { skylineCard } from './lib/cards/skyline.ts';
import { stackCard } from './lib/cards/stack.ts';
import { workCard } from './lib/cards/work.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SNAPSHOT_PATH = path.join(ROOT, 'src', 'data', 'snapshot.json');

export interface RenderResult {
  name: string;
  width: number;
  height: number;
  bytes: number;
}

/** Size budgets: GitHub proxies README images through camo, so every card stays small. */
export const BUDGET = { header: 400 * 1024, card: 250 * 1024 } as const;

function svgDims(svg: string): { width: number; height: number } {
  const m = /<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/.exec(svg);
  return { width: m ? Math.round(Number(m[1])) : 0, height: m ? Math.round(Number(m[2])) : 0 };
}

/** Every README card, by file name, rendered from one view. */
export async function renderReadmeCards(view: SiteView): Promise<[string, string][]> {
  const cards: [string, string][] = [
    ['header.svg', await headerCard(view)],
    ['method.svg', await methodCard(view)],
    ['hud.svg', await hudCard(view)],
    ['skyline.svg', await skylineCard(view)],
    ['stack.svg', await stackCard(view)],
  ];
  for (const id of WORK_IDS) {
    const entry = view.work.find((w) => w.id === id);
    if (!entry) throw new Error(`render-cards: work entry "${id}" not found in the view (check src/content/site.ts)`);
    cards.push([`work-${id}.svg`, await workCard(entry, view.field.born)]);
  }
  return cards;
}

/** The OG image for one locale, as a PNG carrying its provenance. */
export async function renderOgPng(view: SiteView): Promise<Buffer> {
  const svg = await ogCard(view);
  const png = new Resvg(svg, {
    fitTo: { mode: 'width', value: OG_WIDTH },
    font: { fontFiles: [...FONT_FILES], loadSystemFonts: false },
  })
    .render()
    .asPng();
  return withPngText(png, PROVENANCE_KEY, OG_PROVENANCE);
}

export async function renderAll(
  snapshot: Snapshot,
  build: { now: Date; sha: string },
  outDir = path.join(ROOT, 'dist'),
): Promise<RenderResult[]> {
  const viewEn = buildView(snapshot, 'en', build);
  const viewPt = buildView(snapshot, 'pt', build);
  const readmeDir = path.join(outDir, 'readme');
  const ogDir = path.join(outDir, 'og');
  await mkdir(readmeDir, { recursive: true });
  await mkdir(ogDir, { recursive: true });

  const results: RenderResult[] = [];
  for (const [name, svg] of await renderReadmeCards(viewEn)) {
    const bytes = Buffer.byteLength(svg, 'utf8');
    const budget = name === 'header.svg' ? BUDGET.header : BUDGET.card;
    if (bytes > budget) throw new Error(`render-cards: ${name} is ${Math.round(bytes / 1024)} KB, over its ${budget / 1024} KB budget`);
    await writeFile(path.join(readmeDir, name), svg, 'utf8');
    results.push({ name: `readme/${name}`, ...svgDims(svg), bytes });
  }

  for (const [locale, view] of [['en', viewEn], ['pt', viewPt]] as const) {
    const png = await renderOgPng(view);
    await writeFile(path.join(ogDir, `${locale}.png`), png);
    results.push({ name: `og/${locale}.png`, width: OG_WIDTH, height: OG_HEIGHT, bytes: png.length });
  }

  // Generated from the same view as the cards above, so the profile
  // README's alt texts and prose can never drift from what they say.
  const readme = renderReadme(viewEn);
  await writeFile(path.join(readmeDir, 'README.md'), readme, 'utf8');
  results.push({ name: 'readme/README.md', width: 0, height: 0, bytes: Buffer.byteLength(readme, 'utf8') });

  return results;
}

async function main(): Promise<void> {
  const raw = await readFile(SNAPSHOT_PATH, 'utf8');
  const snapshot = JSON.parse(raw) as Snapshot;
  const build = { now: new Date(), sha: process.env.GIT_SHA ?? '' };
  const outDir = process.env.CARDS_OUT_DIR ? path.resolve(process.env.CARDS_OUT_DIR) : path.join(ROOT, 'dist');

  const results = await renderAll(snapshot, build, outDir);

  console.log(`Rendered cards into ${outDir}:`);
  for (const r of results) {
    console.log(`  ${r.name}\t${r.width}x${r.height}\t${(r.bytes / 1024).toFixed(1)} KB`);
  }
}

const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  main().catch((err: unknown) => {
    console.error(err);
    process.exitCode = 1;
  });
}
