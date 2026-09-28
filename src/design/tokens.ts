/**
 * Design tokens, single source of truth.
 *
 * The site reads them as CSS custom properties (see `cssVariables`), and the
 * SVG card renderer (scripts/render-cards.ts) reads the same values directly,
 * so the GitHub profile README and the site cannot drift apart.
 *
 * Palette: the four release roles are the whole color system.
 *   added      shipped and active work, `+` lines, the site plate
 *   changed    the AI engineering field, the current role
 *   merged     upstream contributions to other people's projects
 *   deprecated retired and dormant work, `−` lines
 * All pairs below were checked against WCAG 2.2 AA (text >= 4.5:1).
 */

export type ThemeName = 'light' | 'dark';

export interface Theme {
  /** Page ground. */
  paper: string;
  /** Raised sheet (entries, inputs). */
  sheet: string;
  /** Primary text. */
  ink: string;
  /** Secondary text. */
  ink2: string;
  /** Meta text: dates, counts, captions. */
  ink3: string;
  /** Hairline rules. */
  rule: string;
  added: string;
  onAdded: string;
  addedTint: string;
  changed: string;
  onChanged: string;
  changedTint: string;
  merged: string;
  onMerged: string;
  mergedTint: string;
  deprecated: string;
  onDeprecated: string;
  deprecatedTint: string;
  /** Text selection background. */
  selection: string;
}

export const themes: Record<ThemeName, Theme> = {
  light: {
    paper: '#FAFBFC',
    sheet: '#FFFFFF',
    ink: '#12161D',
    ink2: '#3E4552',
    ink3: '#5D6573',
    rule: '#DDE1E7',
    added: '#127543',
    onAdded: '#FFFFFF',
    addedTint: '#E3F4EA',
    changed: '#F2B71F',
    onChanged: '#12161D',
    changedTint: '#FDF3D6',
    merged: '#2447D6',
    onMerged: '#FFFFFF',
    mergedTint: '#E4EAFD',
    deprecated: '#BF361B',
    onDeprecated: '#FFFFFF',
    deprecatedTint: '#FBE6E0',
    selection: '#F2B71F',
  },
  dark: {
    paper: '#0F1216',
    sheet: '#151A20',
    ink: '#EEF1F5',
    ink2: '#B8C0CC',
    ink3: '#8C95A3',
    rule: '#2A313B',
    added: '#3CC97C',
    onAdded: '#06140C',
    addedTint: '#0F2A1C',
    changed: '#F5C23D',
    onChanged: '#1A1403',
    changedTint: '#2B230B',
    merged: '#7D96FF',
    onMerged: '#070B1C',
    mergedTint: '#151F40',
    deprecated: '#FF7556',
    onDeprecated: '#1A0703',
    deprecatedTint: '#33150E',
    selection: '#F5C23D',
  },
};

/** Release roles, in the order they are introduced on the page. */
export const roles = ['added', 'changed', 'merged', 'deprecated'] as const;
export type Role = (typeof roles)[number];

/**
 * Type. Archivo carries everything across its width axis; Martian Mono is
 * reserved for data: versions, dates, hashes, counts, commands.
 */
export const type = {
  family: {
    sans: 'Archivo',
    mono: 'Martian Mono',
  },
  /** Width axis values (font-stretch percentages). */
  stretch: {
    expanded: 125,
    normal: 100,
    condensed: 75,
  },
  /** rem sizes; display never exceeds 6rem. */
  size: {
    micro: 0.75,
    small: 0.875,
    body: 1,
    lead: 1.25,
    h3: 1.5,
    h2: 2.25,
    h1: 4.5,
    display: 6,
  },
  weight: {
    regular: 400,
    semibold: 600,
    bold: 700,
    black: 900,
  },
} as const;

/**
 * Space. One 4px baseline; every block snaps to whole units of it
 * (the "whole-unit grid" raise). Values are px.
 */
export const space = {
  unit: 4,
  scale: [4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 192] as const,
  columns: 12,
  gutter: 24,
  maxWidth: 1280,
} as const;

/** Hairline and plate geometry. Plates are square-cornered, like printed tags. */
export const shape = {
  hairline: 1,
  rule: 2,
  radius: 2,
} as const;

/** Motion: one authored moment (the Compare diff), exponential ease-out. */
export const motion = {
  ease: 'cubic-bezier(0.16, 1, 0.3, 1)',
  fast: 160,
  base: 320,
  slow: 560,
} as const;

const kebab = (s: string) => s.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);

/** CSS custom properties for one theme, e.g. `--c-added-tint: #E3F4EA;`. */
export function themeVariables(theme: Theme): string {
  return Object.entries(theme)
    .map(([k, v]) => `--c-${kebab(k)}: ${v};`)
    .join(' ');
}

/**
 * The full token stylesheet: light on :root, dark under
 * `prefers-color-scheme: dark`, plus scale tokens.
 */
export function cssVariables(): string {
  const scale = space.scale.map((v, i) => `--s-${i + 1}: ${v / 16}rem;`).join(' ');
  const sizes = Object.entries(type.size)
    .map(([k, v]) => `--t-${k}: ${v}rem;`)
    .join(' ');
  return [
    `:root { color-scheme: light dark; ${themeVariables(themes.light)} ${scale} ${sizes}`,
    `--ease: ${motion.ease}; --d-fast: ${motion.fast}ms; --d-base: ${motion.base}ms; --d-slow: ${motion.slow}ms;`,
    `--max: ${space.maxWidth / 16}rem; --gutter: ${space.gutter / 16}rem; --radius: ${shape.radius}px; }`,
    `@media (prefers-color-scheme: dark) { :root { ${themeVariables(themes.dark)} } }`,
  ].join('\n');
}

/**
 * The retired 2026 vaporwave identity. Not a theme: it only returns behind
 * the Konami code easter egg, as evidence of personality. On-role text is
 * picked per color for AA contrast (dark ink on the light three, white on
 * the purple), independent of the light or dark theme.
 */
export const retired = {
  added: '#00D9FF',
  changed: '#FFEA00',
  merged: '#BD00FF',
  deprecated: '#FF6EC7',
} as const;

/** CSS for `:root[data-theme='vaporwave']`, the easter egg palette. */
export function retiredVariables(): string {
  const dark = themes.light.ink;
  const light = themes.light.sheet;
  const on = { added: dark, changed: dark, merged: light, deprecated: dark } as const;
  const vars = roles.map((r) => `--c-${r}: ${retired[r]}; --c-on-${r}: ${on[r]};`).join(' ');
  return `:root[data-theme='vaporwave'] { ${vars} }`;
}
