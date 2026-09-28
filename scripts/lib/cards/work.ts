/**
 * work-<id>-{light,dark}.svg — 840x300, shown in the README at 49% width
 * (about 410px), so every size here is chosen to still read at roughly
 * half scale: nothing below 26px.
 */

import type { Theme } from '../../../src/design/tokens.ts';
import type { EntryView, SiteView } from '../../../src/lib/view.ts';
import { MONO, SANS, SANS_EXPANDED } from './fonts.ts';
import { flex, hairline, joinProofs, plate, text } from './pieces.ts';

export const WORK_WIDTH = 840;
export const WORK_HEIGHT = 300;

export function workCard(entry: EntryView, field: SiteView['field'], theme: Theme) {
  const nameText = text(
    { fontFamily: SANS_EXPANDED, fontWeight: 700, fontSize: 34, letterSpacing: '-0.01em', color: theme.ink },
    entry.name,
  );

  const headerRow = flex(
    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
    nameText,
    plate(theme, entry.statusRole, entry.statusLabel, { fontSize: 15, padX: 10, padY: 5 }),
  );

  const noteText = text(
    {
      fontFamily: SANS,
      fontWeight: 400,
      fontSize: 26,
      lineHeight: 1.32,
      color: theme.ink2,
      marginTop: 14,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 3,
      overflow: 'hidden',
    },
    entry.note,
  );

  const proofRow = text(
    { fontFamily: MONO, fontWeight: 400, fontSize: 22, color: theme.ink3, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    joinProofs(entry.proofs, 3),
  );

  const labeled = (label: string, value: string) =>
    flex(
      { flexDirection: 'row', alignItems: 'baseline' },
      text({ fontFamily: SANS, fontWeight: 600, fontSize: 20, color: theme.ink3, marginRight: 8 }, label),
      text({ fontFamily: MONO, fontWeight: 400, fontSize: 20, color: theme.ink2 }, value),
    );

  const metaRow = flex(
    { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 14 },
    entry.latest ? labeled(field.latest, entry.latest.date ? `${entry.latest.tag} · ${entry.latest.date}` : entry.latest.tag) : text({}, ''),
    entry.born ? labeled(field.born, String(entry.born)) : text({}, ''),
  );

  return flex(
    {
      width: WORK_WIDTH,
      height: WORK_HEIGHT,
      backgroundColor: theme.paper,
      border: `1px solid ${theme.rule}`,
      padding: 28,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    flex({ flexDirection: 'column' }, headerRow, noteText),
    flex({ flexDirection: 'column' }, hairline(theme, { marginBottom: 14 }), proofRow, metaRow),
  );
}
