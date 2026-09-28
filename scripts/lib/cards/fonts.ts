/**
 * Static TTF instances for satori (it cannot use the site's variable
 * WOFF2 fonts). Each static file is registered under its own family name
 * because satori has no `font-stretch` support: the expanded width axis
 * that carries names and display numerals on the site becomes a distinct
 * family here, "Archivo Expanded", loaded only in black and bold.
 *
 * See assets/fonts/README.md for what each file is.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Font as SatoriFont } from 'satori';

const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = resolve(here, '../../../assets/fonts');

const load = (file: string): Buffer => readFileSync(resolve(fontsDir, file));

/** Sans family, normal width: body text, notes, labels. */
export const SANS = 'Archivo';
/** Sans family, expanded width: names, display numerals, headline weight. */
export const SANS_EXPANDED = 'Archivo Expanded';
/** Monospace family: versions, dates, counts, hashes. */
export const MONO = 'Martian Mono';

let cached: SatoriFont[] | null = null;

/** All font faces satori needs, loaded once. */
export function loadFonts(): SatoriFont[] {
  if (cached) return cached;
  cached = [
    { name: SANS_EXPANDED, data: load('archivo-expanded-black.ttf'), weight: 900, style: 'normal' },
    { name: SANS_EXPANDED, data: load('archivo-expanded-bold.ttf'), weight: 700, style: 'normal' },
    { name: SANS, data: load('archivo-regular.ttf'), weight: 400, style: 'normal' },
    { name: SANS, data: load('archivo-semibold.ttf'), weight: 600, style: 'normal' },
    { name: SANS, data: load('archivo-extrabold.ttf'), weight: 800, style: 'normal' },
    { name: MONO, data: load('martian-mono-regular.ttf'), weight: 400, style: 'normal' },
    { name: MONO, data: load('martian-mono-semibold.ttf'), weight: 600, style: 'normal' },
  ];
  return cached;
}
