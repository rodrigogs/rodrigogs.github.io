/**
 * Renders the GitHub profile README SVG cards and the site's Open Graph
 * PNGs from the exact same view model the site pages consume
 * (src/lib/view.ts), so the README, the OG previews and the site can never
 * show different numbers or different words.
 *
 * Run as the last step of `npm run build` (after `astro build`, so dist/
 * already exists) or directly with `npm run cards`.
 */

import { Resvg } from '@resvg/resvg-js';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import satori, { type SatoriOptions } from 'satori';

import type { Snapshot } from '../src/data/schema.ts';
import { themes } from '../src/design/tokens.ts';
import type { ThemeName } from '../src/design/tokens.ts';
import { buildView } from '../src/lib/view.ts';
import { loadFonts } from './lib/cards/fonts.ts';
import type { VNode } from './lib/cards/h.ts';
import { headerCard, HEADER_HEIGHT, HEADER_WIDTH } from './lib/cards/header.ts';
import { ogCard, OG_HEIGHT, OG_WIDTH } from './lib/cards/og.ts';
import { renderReadme, WORK_IDS } from './lib/cards/readme.ts';
import { roundNumbers, withAccessibleTitle } from './lib/cards/svg.ts';
import { upstreamCard, upstreamTitle, UPSTREAM_WIDTH } from './lib/cards/upstream.ts';
import { workCard, WORK_HEIGHT, WORK_WIDTH } from './lib/cards/work.ts';
import { OG_PROVENANCE, PROVENANCE_KEY, withPngText } from './lib/cards/png.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const SNAPSHOT_PATH = path.join(ROOT, 'src', 'data', 'snapshot.json');
const README_DIR = path.join(ROOT, 'dist', 'readme');
const OG_DIR = path.join(ROOT, 'dist', 'og');

const THEME_NAMES: ThemeName[] = ['light', 'dark'];

export interface RenderResult {
  name: string;
  width: number;
  height: number;
  bytes: number;
}

function svgDims(svg: string): { width: number; height: number } {
  const m = /<svg[^>]*\swidth="([\d.]+)"[^>]*\sheight="([\d.]+)"/.exec(svg);
  return { width: m ? Math.round(Number(m[1])) : 0, height: m ? Math.round(Number(m[2])) : 0 };
}

/**
 * The width/height half of `SatoriOptions`, redeclared: `Omit<SatoriOptions,
 * 'fonts'>` collapses to `{}` because `keyof` on a union type only keeps keys
 * shared by every branch, and "width" and "height" are each only in some
 * branches of satori's own `({width,height}|{width}|{height})` union.
 */
type CardSize = { width: number; height: number } | { width: number } | { height: number };

/** Renders one vnode tree to an SVG string with an embedded accessible title. */
export async function renderSvg(node: VNode, size: CardSize, title: string): Promise<string> {
  const fonts = loadFonts();
  // satori's types expect a React `ReactNode`; it only inspects a plain
  // `{ type, props }` shape at runtime, so our own vnode is compatible.
  const svg = await satori(node as unknown as never, { ...size, fonts } as SatoriOptions);
  return withAccessibleTitle(roundNumbers(svg), title);
}

async function save(dir: string, filename: string, svg: string): Promise<RenderResult> {
  await writeFile(path.join(dir, filename), svg, 'utf8');
  const { width, height } = svgDims(svg);
  return { name: filename, width, height, bytes: Buffer.byteLength(svg, 'utf8') };
}

export async function renderAll(snapshot: Snapshot, build: { now: Date; sha: string }): Promise<RenderResult[]> {
  const viewEn = buildView(snapshot, 'en', build);
  const viewPt = buildView(snapshot, 'pt', build);

  await mkdir(README_DIR, { recursive: true });
  await mkdir(OG_DIR, { recursive: true });

  const results: RenderResult[] = [];

  for (const themeName of THEME_NAMES) {
    const theme = themes[themeName];

    const headerSvg = await renderSvg(
      await headerCard(viewEn, theme),
      { width: HEADER_WIDTH, height: HEADER_HEIGHT },
      `${viewEn.person.name}. ${viewEn.hero.title}`,
    );
    results.push(await save(README_DIR, `header-${themeName}.svg`, headerSvg));

    for (const id of WORK_IDS) {
      const entry = viewEn.work.find((w) => w.id === id);
      if (!entry) throw new Error(`render-cards: work entry "${id}" not found in the view (check src/content/site.ts)`);
      const workSvg = await renderSvg(workCard(entry, viewEn.field, theme), { width: WORK_WIDTH, height: WORK_HEIGHT }, `${entry.name}: ${entry.note}`);
      results.push(await save(README_DIR, `work-${id}-${themeName}.svg`, workSvg));
    }

    const upSvg = await renderSvg(upstreamCard(viewEn, theme), { width: UPSTREAM_WIDTH }, upstreamTitle(viewEn.upstream));
    results.push(await save(README_DIR, `upstream-${themeName}.svg`, upSvg));
  }

  for (const [locale, view] of [['en', viewEn], ['pt', viewPt]] as const) {
    const ogSvg = await renderSvg(ogCard(view, themes.light), { width: OG_WIDTH, height: OG_HEIGHT }, `${view.person.name}. ${view.hero.title}`);
    const png = withPngText(
      new Resvg(ogSvg, { fitTo: { mode: 'width', value: OG_WIDTH } }).render().asPng(),
      PROVENANCE_KEY,
      OG_PROVENANCE,
    );
    await writeFile(path.join(OG_DIR, `${locale}.png`), png);
    results.push({ name: `og/${locale}.png`, width: OG_WIDTH, height: OG_HEIGHT, bytes: png.length });
  }

  // Generated from the same view as the cards above, so the profile
  // README's alt texts and prose can never drift from what they say.
  const readme = renderReadme(viewEn);
  await writeFile(path.join(README_DIR, 'README.md'), readme, 'utf8');
  results.push({ name: 'readme/README.md', width: 0, height: 0, bytes: Buffer.byteLength(readme, 'utf8') });

  return results;
}

async function main(): Promise<void> {
  const raw = await readFile(SNAPSHOT_PATH, 'utf8');
  const snapshot = JSON.parse(raw) as Snapshot;
  const build = { now: new Date(), sha: process.env.GIT_SHA ?? '' };

  const results = await renderAll(snapshot, build);

  console.log('Rendered cards:');
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
