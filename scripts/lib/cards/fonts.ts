/**
 * Static TTF instances for satori (it cannot read the site's WOFF2 files),
 * one face per job, the same four as the site (see `type.family` in
 * src/design/tokens.ts):
 *   SCRIPT   Yellowtail: the pink signature ("Rodrigo")
 *   DISPLAY  Luckiest Guy: white titles with a dark outline
 *   SANS     Inter: everything you read
 *   HUD      Orbitron: numerals and short readouts
 *
 * See assets/fonts/README.md for what each file is.
 */

import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Font as SatoriFont } from 'satori';
import { type } from '../../../src/design/tokens.ts';

const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = resolve(here, '../../../assets/fonts');

const load = (file: string): Buffer => readFileSync(resolve(fontsDir, file));

export const SCRIPT = type.family.script;
export const DISPLAY = type.family.display;
export const SANS = type.family.sans;
export const HUD = type.family.hud;

/** One static face: the satori registration and the file it comes from. */
export interface Face {
  family: string;
  weight: 400 | 600 | 700 | 800 | 900;
  file: string;
}

export const FACES: readonly Face[] = [
  { family: SCRIPT, weight: 400, file: 'yellowtail-regular.ttf' },
  { family: DISPLAY, weight: 400, file: 'luckiest-guy-regular.ttf' },
  { family: SANS, weight: 400, file: 'inter-regular.ttf' },
  { family: SANS, weight: 600, file: 'inter-semibold.ttf' },
  { family: SANS, weight: 800, file: 'inter-extrabold.ttf' },
  { family: HUD, weight: 700, file: 'orbitron-bold.ttf' },
  { family: HUD, weight: 900, file: 'orbitron-black.ttf' },
];

const bytes = new Map<string, Buffer>();

/** The TTF bytes of one face, read once. */
export function faceData(face: Face): Buffer {
  let data = bytes.get(face.file);
  if (!data) {
    data = load(face.file);
    bytes.set(face.file, data);
  }
  return data;
}

/** Absolute paths of every face file (for resvg's `fontFiles`). */
export const FONT_FILES: readonly string[] = FACES.map((f) => resolve(fontsDir, f.file));

let cached: SatoriFont[] | null = null;

/** All font faces satori needs, loaded once. */
export function loadFonts(): SatoriFont[] {
  if (cached) return cached;
  cached = FACES.map((f) => ({ name: f.family, data: faceData(f), weight: f.weight, style: 'normal' as const }));
  return cached;
}
