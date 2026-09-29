/**
 * Renders the GitHub profile README from the exact same view model as the
 * cards (src/lib/view.ts), so alt texts and prose can never drift from
 * what the cards say. English only: the profile README has no locale
 * switch.
 *
 * Its weight is on how I work with AI (the method card, repeated as a
 * plain list for screen readers and search); the AI projects and
 * collaborations are one line.
 */

import type { SiteView } from '../../../src/lib/view.ts';
import { sectionId } from '../../../src/lib/view.ts';
import { headerTitle } from './header.ts';
import { hudTitle } from './hud.ts';
import { methodTitle } from './method.ts';
import { skylineTitle } from './skyline.ts';
import { stackTitle } from './stack.ts';
import { workTitle } from './work.ts';

/** Work entries embedded in the README, in the order it lists them. */
export const WORK_IDS = ['whats-reader', 'mysql-events', 'pg-turbo', 'vibewatch', 'baileys-store', 'easyvpn'] as const;

const SITE_URL = 'https://rodrigogs.github.io';
const CARDS_URL = `${SITE_URL}/readme`;

/** Display names for the upstream repos named in the collaborations line. */
const UPSTREAM_NAMES: Record<string, string> = { 'nesquena/hermes-webui': 'Hermes WebUI' };

/** Stack groups listed as text under the stack card (the rest live on the site). */
const STACK_GROUPS = ['Agents', 'Models', 'MCP servers', 'Quality'];

/** Escapes the handful of characters that would break an HTML attribute. */
function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/** A linked card image: one file, since the night art reads on both GitHub themes. */
function card(opts: { href: string; file: string; alt: string; width?: string }): string {
  return `<a href="${opts.href}"><img alt="${escapeAttr(opts.alt)}" src="${CARDS_URL}/${opts.file}" width="${opts.width ?? '100%'}"></a>`;
}

/** Oxford-free English list: "a", "a and b", or "a, b and c". */
function joinList(items: readonly string[]): string {
  if (items.length <= 1) return items[0] ?? '';
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}

/** Groups a flat array into fixed-size chunks, the last one short if needed. */
function chunk<T>(items: readonly T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

/** The one line for AI projects and collaborations. */
export function aiProjectsLine(view: SiteView): string {
  const link = (name: string, href: string | undefined) => (href ? `[${name}](${href})` : name);
  const tooling = view.ai.filter((p) => p.id !== 'hermes-agent').map((p) => link(p.name, p.links[0]?.href));
  const agent = view.ai.find((p) => p.id === 'hermes-agent');
  const upstream = [
    ...(agent ? [link(agent.name, agent.links[0]?.href)] : []),
    ...view.upstream
      .filter((u) => UPSTREAM_NAMES[u.repo])
      .map((u) => link(UPSTREAM_NAMES[u.repo]!, u.proofUrl)),
  ];
  const parts = [
    tooling.length ? `I also publish agent tooling (${joinList(tooling)})` : '',
    upstream.length ? `contribute to ${joinList(upstream)}` : '',
  ].filter(Boolean);
  if (parts.length === 0) return '';
  const sentence = parts.length === 2 ? `${parts[0]} and ${parts[1]}` : parts[0]!.replace(/^contribute/, 'I also contribute');
  return `${sentence}.`;
}

export function renderReadme(view: SiteView): string {
  const header = card({ href: `${SITE_URL}/`, file: 'header.svg', alt: headerTitle(view) });

  const intro =
    `I'm a Senior Software Engineer at Globant on the Disney Entertainment account, shipping software since ${view.person.since}, ` +
    `remote from ${view.person.location}.`;
  const linkedin = view.person.linkedin ? ` · [LinkedIn](${view.person.linkedin})` : '';
  const links = `[Site](${SITE_URL}/) · [Em português](${SITE_URL}/pt/)${linkedin} · [Email](mailto:${view.person.email})`;

  const method = card({ href: `${SITE_URL}/#${sectionId('ai')}`, file: 'method.svg', alt: methodTitle(view) });
  const steps = view.aiWorkflow.items.map((s, i) => `${i + 1}. **${s.name}**: ${s.text}`).join('\n');
  const builtWith = `${view.aiWorkflow.builtWith} [Source](${view.aiWorkflow.builtWithHref}).`;

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

  const stack = card({ href: `${SITE_URL}/#${sectionId('stack')}`, file: 'stack.svg', alt: stackTitle() });
  const ships = `**${view.stack.ships.label}**: ${joinList(view.stack.ships.items)}.`;
  const tools = view.stack.groups
    .filter((g) => STACK_GROUPS.includes(g.label))
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
    '## How I work with AI',
    '',
    method,
    '',
    // The same steps as text, for screen readers and search, folded so the card stays the thing you see.
    '<details><summary>The method as text</summary>',
    '',
    steps,
    '',
    '</details>',
    '',
    builtWith,
    '',
    hud,
    skyline,
    '',
    '## Selected work',
    '',
    work,
    '',
    aiProjectsLine(view),
    '',
    '## Stack',
    '',
    stack,
    '',
    ships,
    '',
    tools,
    '',
    closing,
    '',
  ].join('\n');
}
