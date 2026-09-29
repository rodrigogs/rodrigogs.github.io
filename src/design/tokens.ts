/**
 * Design tokens, single source of truth.
 *
 * World: a 1986 Miami night. Sunset over the ocean, palm silhouettes, Art
 * Deco facades lit by neon, and a game-menu UI laid over it (an homage to
 * the era's console crime games, built from our own shapes and words: no
 * third-party logos, names, fonts or art).
 *
 * The site reads these as CSS custom properties (see `cssVariables`), the
 * hero shader reads `scene`, and the README card renderer
 * (scripts/render-cards.ts) reads the same values, so the site, the hero
 * and the GitHub profile cannot drift apart.
 *
 * Palette roles:
 *   brand       hot pink: the name, headings, the success toast
 *   select      the one selection color: hover, focus, current item (as in
 *               the menus it pays homage to, one highlight everywhere)
 *   added       cyan: products, `+` lines, the HUD clock
 *   changed     sun yellow: the current role
 *   merged      violet: AI and open source
 *   deprecated  sunset orange: legacy work, `−` lines
 * Every text pair below was checked against WCAG 2.2 AA on `night` and
 * `panel` (text >= 4.5:1).
 */

export type ThemeName = 'night';

export interface Theme {
  /** Page ground: the night sky over the water. */
  night: string;
  /** Raised panels (menu frames, cards). */
  panel: string;
  /** Panel edge and hairlines. */
  rule: string;
  /** Primary text. */
  ink: string;
  /** Secondary text. */
  ink2: string;
  /** Meta text: dates, counts, captions. */
  ink3: string;
  brand: string;
  onBrand: string;
  select: string;
  onSelect: string;
  added: string;
  onAdded: string;
  addedTint: string;
  changed: string;
  onChanged: string;
  changedTint: string;
  merged: string;
  /** Violet is too dark for text on the night; use this for violet text. */
  mergedText: string;
  onMerged: string;
  mergedTint: string;
  deprecated: string;
  onDeprecated: string;
  deprecatedTint: string;
  /** Text selection background. */
  selection: string;
}

export const themes: Record<ThemeName, Theme> = {
  night: {
    night: '#0E0826',
    panel: '#1C1440',
    rule: '#3A2C72',
    ink: '#FFF6FB',
    ink2: '#E4D6FF',
    ink3: '#B8A6E6',
    brand: '#FF6EC7',
    onBrand: '#1A0526',
    select: '#00FF97',
    onSelect: '#04140C',
    added: '#00D9FF',
    onAdded: '#06101F',
    addedTint: '#062A3A',
    changed: '#FFEA00',
    onChanged: '#1A1400',
    changedTint: '#2E2A06',
    merged: '#BD00FF',
    mergedText: '#D580FF',
    onMerged: '#FFFFFF',
    mergedTint: '#2A0A40',
    deprecated: '#FF8C42',
    onDeprecated: '#1A0800',
    deprecatedTint: '#3A1A0A',
    selection: '#FF6EC7',
  },
};

/** Release roles used by plates, statuses and diff lines. */
export const roles = ['added', 'changed', 'merged', 'deprecated'] as const;
export type Role = (typeof roles)[number];

/**
 * The hero scene: one palette for the CSS poster, the WebGL shader uniforms
 * and the SVG silhouettes, so the three layers line up.
 */
export const scene = {
  /** Sky, top to horizon. */
  skyTop: '#12002A',
  skyMid: '#5B1A7A',
  skyLow: '#FF5E8A',
  horizon: '#FF9A5A',
  /** Sun, top to bottom. */
  sunTop: '#FFEA00',
  sunBottom: '#FF3EA5',
  /** Water, near to far. */
  waterNear: '#0B0420',
  waterFar: '#2A0F4A',
  /** Silhouettes: palms and the Art Deco skyline. */
  silhouette: '#140626',
  /** Neon edges on the skyline. */
  neonPink: '#FF6EC7',
  neonCyan: '#00D9FF',
  /** Horizon line as a fraction of the hero height, from the top. */
  horizonAt: 0.62,
} as const;

/**
 * Type. Four faces, each with one job:
 *   script  the pink brush-script signature (the name only)
 *   display heavy rounded titles, white with a dark outline (headings, big numbers)
 *   sans    everything you read (body, labels, UI)
 *   hud     numerals and short readouts in the HUD, tabular
 */
export const type = {
  family: {
    script: 'Yellowtail',
    display: 'Luckiest Guy',
    sans: 'Inter',
    hud: 'Orbitron',
  },
  /** rem sizes. */
  size: {
    micro: 0.75,
    small: 0.875,
    body: 1,
    lead: 1.25,
    h3: 1.5,
    h2: 2.5,
    h1: 4.5,
    display: 7,
  },
  weight: {
    regular: 400,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;

/** Space. One 4px baseline; every block snaps to whole units of it. Values are px. */
export const space = {
  unit: 4,
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const,
  columns: 12,
  gutter: 24,
  maxWidth: 1280,
} as const;

/** Geometry: menu frames have a thick dark border; the selection bar is rounded. */
export const shape = {
  hairline: 1,
  frame: 4,
  radius: 4,
  pill: 999,
} as const;

/** Motion: exponential ease-out; the scene and the toast are the authored moments. */
export const motion = {
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  fast: 160,
  base: 320,
  slow: 560,
} as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** CSS custom properties for one theme, e.g. `--c-added-tint: #062A3A;`. */
export function themeVariables(theme: Theme): string {
  return Object.entries(theme)
    .map(([k, v]) => `--c-${kebab(k)}: ${v};`)
    .join(' ');
}

/** CSS custom properties for the hero scene, e.g. `--scene-sky-top: #12002A;`. */
export function sceneVariables(): string {
  return Object.entries(scene)
    .filter(([, v]) => typeof v === 'string')
    .map(([k, v]) => `--scene-${kebab(k)}: ${v};`)
    .join(' ');
}

/** The full token stylesheet (one night theme; the world has no daytime). */
export function cssVariables(): string {
  const scale = space.scale.map((v, i) => `--s-${i + 1}: ${v / 16}rem;`).join(' ');
  const sizes = Object.entries(type.size)
    .map(([k, v]) => `--t-${k}: ${v}rem;`)
    .join(' ');
  return [
    `:root { color-scheme: dark; ${themeVariables(themes.night)} ${sceneVariables()} ${scale} ${sizes}`,
    `--ease: ${motion.ease}; --d-fast: ${motion.fast}ms; --d-base: ${motion.base}ms; --d-slow: ${motion.slow}ms;`,
    `--max: ${space.maxWidth / 16}rem; --gutter: ${space.gutter / 16}rem; --radius: ${shape.radius}px; --frame: ${shape.frame}px; }`,
  ].join('\n');
}

/**
 * Easter egg: a cheat code switches the night to the owner's original
 * vaporwave (the perspective grid and the old neon four).
 */
export const vaporwave = {
  added: '#00D9FF',
  changed: '#FFEA00',
  merged: '#BD00FF',
  deprecated: '#FF6EC7',
  grid: '#FF6EC7',
} as const;
