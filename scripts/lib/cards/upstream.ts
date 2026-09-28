/**
 * upstream-{light,dark}.svg — 1280 wide, as tall as the rows need (rendered
 * with only a width, so satori sizes the height from content), capped at 7
 * rows. One cobalt "Open source" plate and the section claim head the card; per row: repo,
 * stars, the count (already worded correctly as commits vs merged PRs by
 * the view layer), and the note.
 */

import type { Theme } from '../../../src/design/tokens.ts';
import type { SiteView, UpstreamView } from '../../../src/lib/view.ts';
import { MONO, SANS, SANS_EXPANDED } from './fonts.ts';
import { flex, plate, text } from './pieces.ts';

export const UPSTREAM_WIDTH = 1280;
export const UPSTREAM_MAX_ROWS = 7;

function upstreamRowNode(row: UpstreamView, field: SiteView['field'], theme: Theme, isLast: boolean) {
  const left = flex(
    { flexDirection: 'column', flexBasis: '500px', flexShrink: 0 },
    text({ fontFamily: SANS_EXPANDED, fontWeight: 700, fontSize: 22, color: theme.ink }, row.repo),
    text({ fontFamily: MONO, fontWeight: 400, fontSize: 18, color: theme.ink3, marginTop: 6 }, `${row.stars} ${field.stars} · ${row.count}`),
  );

  const note = text(
    {
      fontFamily: SANS,
      fontWeight: 400,
      fontSize: 20,
      color: theme.ink2,
      flex: 1,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden',
    },
    row.note,
  );

  return flex(
    {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 32,
      paddingTop: 20,
      paddingBottom: 20,
      ...(isLast ? {} : { borderBottom: `1px solid ${theme.rule}` }),
    },
    left,
    note,
  );
}

/** How many repos the accessible title names before falling back to "and more." */
const TITLE_NAMES = 4;

/**
 * "Upstream contributions: hermes-agent, Rocket.Chat, hermes-webui and
 * moleculer.": the card's accessible title, and the alt text for its
 * README embed. Built as one Oxford-free list; "and more" is appended
 * only when rows are omitted, and never doubled with the list's own "and".
 */
export function upstreamTitle(rows: UpstreamView[]): string {
  const names = rows.map((r) => r.repo.split('/')[1] ?? r.repo);
  const shown = names.slice(0, TITLE_NAMES);
  const omitted = names.length > shown.length;
  const list =
    shown.length <= 1
      ? (shown[0] ?? '')
      : omitted
        ? shown.join(', ')
        : `${shown.slice(0, -1).join(', ')} and ${shown[shown.length - 1]}`;
  return `Open source contributions: ${list}${omitted ? ' and more.' : '.'}`;
}

export function upstreamCard(view: SiteView, theme: Theme) {
  const rows = view.upstream.slice(0, UPSTREAM_MAX_ROWS);

  const header = flex(
    { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 24, borderBottom: `1px solid ${theme.rule}`, marginBottom: 8 },
    plate(theme, 'merged', view.sections.openSource.label),
    text({ fontFamily: SANS, fontWeight: 600, fontSize: 26, color: theme.ink }, view.sections.openSource.claim),
  );

  return flex(
    {
      width: UPSTREAM_WIDTH,
      backgroundColor: theme.paper,
      border: `1px solid ${theme.rule}`,
      padding: 40,
      flexDirection: 'column',
    },
    header,
    ...rows.map((row, i) => upstreamRowNode(row, view.field, theme, i === rows.length - 1)),
  );
}
