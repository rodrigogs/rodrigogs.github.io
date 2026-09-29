/**
 * Renders the GitHub profile README from the exact same view model as the
 * cards (src/lib/view.ts), so alt texts and prose can never drift from
 * what the cards say. English only: the profile README has no locale
 * switch.
 *
 * It opens with the same two About paragraphs as the site (who I am, and
 * how AI fits into my day, in plain prose), then the numbers, the
 * featured work, one line of smaller work, one line of upstream work and
 * the stack.
 */

import type { SiteView } from '../../../src/lib/view.ts';
import { sectionId } from '../../../src/lib/view.ts';
import { headerTitle } from './header.ts';
import { hudTitle } from './hud.ts';
import { skylineTitle } from './skyline.ts';
import { stackTitle } from './stack.ts';
import { workTitle } from './work.ts';

/** Work entries embedded in the README, in the order it lists them. */
export const WORK_IDS = ['whats-reader', 'mysql-events', 'pg-turbo', 'vibewatch', 'baileys-store', 'easyvpn'] as const;

const SITE_URL = 'https://rodrigogs.github.io';
const CARDS_URL = `${SITE_URL}/readme`;

/** Escapes the handful of characters that would break an HTML attribute. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A linked card image: one file, since the night art reads on both GitHub themes. */
function card(opts: { href: string; file: string; alt: string; width?: string }): string {
  return `<a href="${opts.href}"><img alt="${escapeAttr(opts.alt)}" src="${CARDS_URL}/${opts.file}" width="${opts.width ?? '100%'}"></a>`;
}

/** Groups a flat array into fixed-size chunks, the last one short if needed. */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** The site's "Also" line: smaller public work, name linked, a short note each. */
export function alsoLine(view: SiteView): string {
  const items = view.moreWork.items.map((m) => `[${m.name}](${m.href}), ${m.note}`);
  return items.length ? `${view.moreWork.label}: ${items.join(' · ')}.` : '';
}

/** Upstream work in one line, the count linking to its proof. */
export function upstreamLine(view: SiteView): string {
  const items = view.upstream.map((u) => `[${u.repo}](${u.url}) ([${u.count}](${u.proofUrl}))`);
  return items.length ? `Open source: ${items.join(' · ')}.` : '';
}

export function renderReadme(view: SiteView): string {
  const header = card({ href: `${SITE_URL}/`, file: 'header.svg', alt: headerTitle(view) });

  const linkedin = view.person.linkedin ? ` · [LinkedIn](${view.person.linkedin})` : '';
  const links =
    `Remote from ${view.person.location} (${view.person.timezone}) · ` +
    `[Site](${SITE_URL}/) · [Em português](${SITE_URL}/pt/)${linkedin} · [Email](mailto:${view.person.email})`;

  const hud = card({ href: `${SITE_URL}/`, file: 'hud.svg', alt: hudTitle(view) });
  const skyline = card({ href: view.person.github, file: 'skyline.svg', alt: skylineTitle(view.contributionYear) });

  const workCards = WORK_IDS.map((id) => {
    const entry = view.work.find((w) => w.id === id);
    if (!entry) throw new Error(`renderReadme: work entry "${id}" not found in the view (check src/content/site.ts)`);
    return card({ href: `${SITE_URL}/#${id}`, file: `work-${id}.svg`, alt: workTitle(entry), width: '49%' });
  });
  const work = chunk(workCards, 2)
    .map((pair) => pair.join(' '))
    .join('\n');

  const stack = card({ href: `${SITE_URL}/#${sectionId('about')}`, file: 'stack.svg', alt: stackTitle(view) });
  // The stack card's two rows as text, for screen readers and search.

  const closing = `<sub>Cards refresh daily from GitHub, npm and crates.io. More at <a href="${SITE_URL}/">rodrigogs.github.io</a>.</sub>`;

  return [
    header,
    '',
    view.about.claim,
    '',
    view.about.body,
    '',
    links,
    '',
    hud,
    skyline,
    '',
    '## Selected work',
    '',
    work,
    '',
    alsoLine(view),
    '',
    upstreamLine(view),
    '',
    '## Stack',
    '',
    stack,
    '',
    closing,
    '',
  ].join('\n');
}
