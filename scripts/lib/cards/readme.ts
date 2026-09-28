/**
 * Renders the GitHub profile README from the exact same view model as the
 * SVG cards (src/lib/view.ts), so alt texts and prose can never drift from
 * what the cards themselves already say. English only: the profile README
 * has no locale switch.
 */

import type { AiProjectView, EntryView, SiteView } from '../../../src/lib/view.ts';
import { upstreamTitle } from './upstream.ts';

/** Work entries embedded in the README, in the order it lists them. */
export const WORK_IDS = ['whats-reader', 'mysql-events', 'pg-turbo', 'vibewatch', 'baileys-store', 'easyvpn'] as const;

const SITE_URL = 'https://rodrigogs.github.io';
const CARDS_URL = `${SITE_URL}/readme`;

/** Escapes the handful of characters that would break an HTML attribute. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A linked light/dark `<picture>` embed, the one image pattern every card section uses. */
function picture(opts: { href: string; dark: string; light: string; alt: string; width?: string }): string {
  const widthAttr = opts.width ? ` width="${opts.width}"` : '';
  return (
    `<a href="${opts.href}"><picture>` +
    `<source media="(prefers-color-scheme: dark)" srcset="${opts.dark}">` +
    `<img alt="${escapeAttr(opts.alt)}" src="${opts.light}"${widthAttr}>` +
    '</picture></a>'
  );
}

/** Oxford-free English list: "a", "a and b", or "a, b and c". */
function joinList(items: readonly string[]): string {
  if (items.length === 0) return '';
  if (items.length === 1) return items[0]!;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Groups a flat array into fixed-size chunks, the last one short if needed. */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/**
 * `entry.facts` rendered as plain text ("1,959 tests, 100% branch coverage."),
 * distinguished from the entry's other proofs (stars, commits, PRs opened)
 * by the one structural difference the view already carries: a fact proof
 * has no `href`, since it names a number rather than linking to its source.
 */
function factsText(entry: AiProjectView): string {
  const facts = entry.proofs.filter((p) => !p.href);
  if (facts.length === 0) return '';
  return ` ${facts.map((f) => `${f.value} ${f.label}`).join(', ')}.`;
}

function aiBullet(entry: AiProjectView): string {
  const link = entry.links[0];
  const name = link ? `[${entry.name}](${link.href})` : entry.name;
  return `- **${name}**: ${entry.note}${factsText(entry)}`;
}

function workCardHtml(id: string, entry: EntryView): string {
  return picture({
    href: `${SITE_URL}/#${id}`,
    dark: `${CARDS_URL}/work-${id}-dark.svg`,
    light: `${CARDS_URL}/work-${id}-light.svg`,
    alt: `${entry.name}: ${entry.note}`,
    width: '49%',
  });
}

export function renderReadme(view: SiteView): string {
  const header = picture({
    href: `${SITE_URL}/`,
    dark: `${CARDS_URL}/header-dark.svg`,
    light: `${CARDS_URL}/header-light.svg`,
    alt: `${view.person.name}. ${view.hero.title}`,
  });

  const intro =
    `**Senior Software Engineer** at Globant on the Disney Entertainment account, shipping software since ${view.person.since}. ` +
    `Remote from ${view.person.location} (${view.person.timezone}). English and Portuguese.`;
  const linkedin = view.person.linkedin ? ` · [LinkedIn](${view.person.linkedin})` : '';
  const links = `[Site](${SITE_URL}/) · [Em português](${SITE_URL}/pt/)${linkedin} · [Email](mailto:${view.person.email})`;

  const ai = view.ai.map(aiBullet).join('\n');
  const capabilities = `**${view.aiCapabilities.label}**: ${view.aiCapabilities.items.map((k) => k.name).join(' · ')}`;

  const workCards = WORK_IDS.map((id) => {
    const entry = view.work.find((w) => w.id === id);
    if (!entry) throw new Error(`renderReadme: work entry "${id}" not found in the view (check src/content/site.ts)`);
    return workCardHtml(id, entry);
  });
  const releases = chunk(workCards, 2)
    .map((pair) => pair.join(''))
    .join('\n');


  const upstream = picture({
    href: `${SITE_URL}/#open-source`,
    dark: `${CARDS_URL}/upstream-dark.svg`,
    light: `${CARDS_URL}/upstream-light.svg`,
    alt: upstreamTitle(view.upstream),
  });

  const ships = `**${view.stack.ships.label}**: ${joinList(view.stack.ships.items)}.`;
  // One line per group (Agents, Models, MCP servers...), so the list reads as a manifest, not a badge wall.
  const tools = view.stack.groups
    .filter((g) => g.label !== 'Quality')
    .map((g) => `**${g.label}**: ${g.items.join(' · ')}`)
    .join('<br>\n');

  const closing =
    '<sub>Cards refresh daily from GitHub, npm and crates.io. The full history of the work, including a stack diff ' +
    `between any two years, is at <a href="${SITE_URL}/">rodrigogs.github.io</a>.</sub>`;

  return [
    header,
    '',
    intro,
    '',
    links,
    '',
    '## AI engineering',
    '',
    ai,
    '',
    capabilities,
    '',
    '## Selected work',
    '',
    releases,
    '',
    '## Open source',
    '',
    upstream,
    '',
    '## Stack',
    '',
    ships,
    '',
    tools,
    '',
    closing,
    '',
  ].join('\n');
}
