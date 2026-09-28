/**
 * header-{light,dark}.svg — 1280x400. The masthead of the profile README:
 * the name and role on the left with the CalVer "Latest" plate beside it
 * (never above it, as an eyebrow would sit), the three hero notes on the
 * right, each in its release-role plate. Same grammar as the site's first
 * viewport, cropped to what a README needs.
 */

import type { Theme } from '../../../src/design/tokens.ts';
import type { SiteView } from '../../../src/lib/view.ts';
import { SANS, SANS_EXPANDED } from './fonts.ts';
import { calverPlate, flex, hairline, nameLines, plateBox, text } from './pieces.ts';

export const HEADER_WIDTH = 1280;
export const HEADER_HEIGHT = 400;

export function headerCard(view: SiteView, theme: Theme) {
  const [line1, line2] = nameLines(view.person.name);

  const name = flex(
    { flexDirection: 'column' },
    text({ fontFamily: SANS_EXPANDED, fontWeight: 900, fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.02em', color: theme.ink }, line1),
    line2
      ? text({ fontFamily: SANS_EXPANDED, fontWeight: 900, fontSize: 60, lineHeight: 1.02, letterSpacing: '-0.02em', color: theme.ink }, line2)
      : null,
  );

  const roleLine = text({ fontFamily: SANS, fontWeight: 600, fontSize: 22, color: theme.ink2, marginTop: 16 }, view.person.role);

  const left = flex(
    { flexDirection: 'column', flexBasis: '660px', flexShrink: 0, justifyContent: 'center' },
    name,
    roleLine,
    flex({ marginTop: 24 }, calverPlate(theme, view.hero.calver, view.hero.latestLabel)),
  );

  const noteRows = view.hero.notes.map((note, i) =>
    flex(
      { flexDirection: 'column', flexGrow: 1, justifyContent: 'center', paddingTop: i === 0 ? 0 : 20, paddingBottom: i === view.hero.notes.length - 1 ? 0 : 20 },
      flex(
        { flexDirection: 'row', alignItems: 'flex-start', gap: 16 },
        plateBox(theme, note.role, { padX: 10, padY: 5 }, text({ fontFamily: SANS, fontWeight: 700, fontSize: 14, whiteSpace: 'pre' }, note.label)),
        text({ fontFamily: SANS, fontWeight: 400, fontSize: 21, lineHeight: 1.35, color: theme.ink, flex: 1 }, note.text),
      ),
    ),
  );

  const notesWithRules: ReturnType<typeof flex>[] = [];
  noteRows.forEach((row, i) => {
    if (i > 0) notesWithRules.push(hairline(theme));
    notesWithRules.push(row);
  });

  const right = flex({ flexDirection: 'column', flexGrow: 1, justifyContent: 'center', paddingLeft: 48 }, ...notesWithRules);

  return flex(
    {
      width: HEADER_WIDTH,
      height: HEADER_HEIGHT,
      backgroundColor: theme.paper,
      border: `1px solid ${theme.rule}`,
      padding: 48,
      flexDirection: 'row',
    },
    left,
    right,
  );
}
