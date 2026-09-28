/**
 * upstream-{light,dark}.svg — 1280 wide, as tall as the rows need (rendered
 * with only a width, so satori sizes the height from content), capped at 7
 * rows. One cobalt "Merged" plate marks the whole section, per row: repo,
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
    { flexDirection: 'column', flexBasis: '380px', flexShrink: 0 },
    text({ fontFamily: SANS_EXPANDED, fontWeight: 700, fontSize: 24, color: theme.ink }, row.repo),
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

export function upstreamCard(view: SiteView, theme: Theme) {
  const rows = view.upstream.slice(0, UPSTREAM_MAX_ROWS);

  const header = flex(
    { flexDirection: 'row', alignItems: 'center', gap: 16, paddingBottom: 24, borderBottom: `1px solid ${theme.rule}`, marginBottom: 8 },
    plate(theme, 'merged', view.roleLabel.merged),
    text({ fontFamily: SANS_EXPANDED, fontWeight: 700, fontSize: 28, color: theme.ink }, view.sections.upstream.label),
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
