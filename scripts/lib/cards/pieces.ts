/**
 * Shared vnode atoms for the cards: the same visual grammar as the site
 * (solid role plates, hairline rules, square corners), built from the one
 * token source so the README and the site can never drift apart.
 */

import { shape } from '../../../src/design/tokens.ts';
import type { Role, Theme } from '../../../src/design/tokens.ts';
import { type Child, h, type VNode } from './h.ts';
import { MONO, SANS } from './fonts.ts';

/** `theme.added` / `theme.onAdded`, keyed by role name. */
export function roleColors(theme: Theme, role: Role): { bg: string; fg: string } {
  const onKey = `on${role[0]!.toUpperCase()}${role.slice(1)}` as keyof Theme;
  return { bg: theme[role], fg: theme[onKey] as string };
}

/** A flex container; satori requires an explicit display on every element with children. */
export function flex(style: Record<string, unknown>, ...children: (Child | Child[])[]): VNode {
  return h('div', { style: { display: 'flex', ...style } }, ...children);
}

/** A text leaf. */
export function text(style: Record<string, unknown>, content: string): VNode {
  return h('div', { style }, content);
}

export interface PlateOpts {
  fontSize?: number;
  padX?: number;
  padY?: number;
  weight?: number;
  /**
   * Fixed outer width (border-box, so it already covers `padX`), for a row
   * of plates that must share one column regardless of label length. Omit
   * to size the plate to its content, the usual case.
   */
  width?: number;
  justifyContent?: string;
}

/** The bare solid-fill box, for plates that mix fonts (e.g. a mono value next to a sans label). */
export function plateBox(theme: Theme, role: Role, opts: PlateOpts = {}, ...children: (Child | Child[])[]): VNode {
  const { bg, fg } = roleColors(theme, role);
  const { padX = 10, padY = 6, width, justifyContent } = opts;
  return flex(
    {
      alignItems: 'center',
      ...(justifyContent ? { justifyContent } : {}),
      ...(width !== undefined ? { width, flexShrink: 0, boxSizing: 'border-box' } : {}),
      backgroundColor: bg,
      color: fg,
      padding: `${padY}px ${padX}px`,
    },
    ...children,
  );
}

/** A solid role plate: the tag used for statuses, release roles and section marks. */
export function plate(theme: Theme, role: Role, label: string, opts: PlateOpts = {}): VNode {
  const { fontSize = 16, weight = 700 } = opts;
  return plateBox(theme, role, opts, text({ fontFamily: SANS, fontWeight: weight, fontSize, lineHeight: 1.2, whiteSpace: 'pre' }, label));
}

/** A 1px hairline rule, the entry separator across every card. */
export function hairline(theme: Theme, style: Record<string, unknown> = {}): VNode {
  return flex({ height: shape.hairline, backgroundColor: theme.rule, flexShrink: 0, ...style });
}

/** `"519 stars · 112 downloads / 30 days"`: the proof row, capped so a card never overflows. */
/**
 * Proof line for a card: at most `max` proofs, and never more characters
 * than fit one line of the card (proofs are dropped whole, never cut).
 */
export function joinProofs(proofs: { value: string; label: string }[], max = 3, maxChars = 52): string {
  const parts: string[] = [];
  for (const p of proofs.slice(0, max)) {
    const part = `${p.value} ${p.label}`;
    const next = parts.length ? `${parts.join(' · ')} · ${part}` : part;
    if (parts.length && next.length > maxChars) break;
    parts.push(part);
  }
  return parts.join(' · ');
}

/** Splits a "First Last" or "First Middle Last" name into two display lines. */
export function nameLines(name: string): [string, string] {
  const words = name.split(' ');
  if (words.length <= 2) return [name, ''];
  return [words.slice(0, -2).join(' '), words.slice(-2).join(' ')];
}

/** The green site plate ("rodrigogs.github.io"), shared by the README header and the OG images. */
export function sitePlate(theme: Theme, siteUrl: string, opts: PlateOpts = {}): VNode {
  const { padX = 14, padY = 8 } = opts;
  return plateBox(
    theme,
    'added',
    { padX, padY },
    text({ fontFamily: MONO, fontWeight: 600, fontSize: opts.fontSize ?? 18, lineHeight: 1 }, siteUrl.replace(/^https?:\/\//, '')),
  );
}
