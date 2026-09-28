/**
 * og/{en,pt}.png — 1200x630 social preview, light theme (the scene is a
 * link unfurl card, always rendered on a light chrome by the platforms that
 * show it). Name, role, the release title, the CalVer plate and a diff
 * strip (+added / -removed) as the world's signature mark, compact enough
 * to read at social-card thumbnail size.
 */

import type { Theme } from '../../../src/design/tokens.ts';
import type { SiteView } from '../../../src/lib/view.ts';
import { MONO, SANS, SANS_EXPANDED } from './fonts.ts';
import { calverPlate, flex, nameLines, plateBox, text } from './pieces.ts';

export const OG_WIDTH = 1200;
export const OG_HEIGHT = 630;

function diffPlate(theme: Theme, role: 'added' | 'deprecated', sign: string, count: number, label: string) {
  return plateBox(
    theme,
    role,
    { padX: 16, padY: 10 },
    text({ fontFamily: MONO, fontWeight: 600, fontSize: 24, lineHeight: 1 }, `${sign}${count}`),
    text({ fontFamily: SANS, fontWeight: 700, fontSize: 18, lineHeight: 1, marginLeft: 10 }, label),
  );
}

export function ogCard(view: SiteView, theme: Theme) {
  const [line1, line2] = nameLines(view.person.name);

  const name = flex(
    { flexDirection: 'column' },
    text({ fontFamily: SANS_EXPANDED, fontWeight: 900, fontSize: 72, lineHeight: 1.02, letterSpacing: '-0.02em', color: theme.ink }, line1),
    line2
      ? text({ fontFamily: SANS_EXPANDED, fontWeight: 900, fontSize: 72, lineHeight: 1.02, letterSpacing: '-0.02em', color: theme.ink }, line2)
      : null,
  );

  const roleLine = text({ fontFamily: SANS, fontWeight: 600, fontSize: 28, color: theme.ink2, marginTop: 20 }, view.person.role);

  const title = text(
    {
      fontFamily: SANS,
      fontWeight: 400,
      fontSize: 30,
      lineHeight: 1.35,
      color: theme.ink,
      marginTop: 28,
      maxWidth: 920,
      display: '-webkit-box',
      WebkitBoxOrient: 'vertical',
      WebkitLineClamp: 2,
      overflow: 'hidden',
    },
    view.hero.title,
  );

  const { added, removed } = view.compare.data.initial;
  const addedLabel = added.length === 1 ? view.compare.addedOne : view.compare.added;
  const removedLabel = removed.length === 1 ? view.compare.removedOne : view.compare.removed;

  const bottom = flex(
    { flexDirection: 'row', alignItems: 'center', gap: 20, marginTop: 40 },
    calverPlate(theme, view.hero.calver, view.hero.latestLabel, { fontSize: 22, padX: 16, padY: 10 }),
    diffPlate(theme, 'added', '+', added.length, addedLabel),
    diffPlate(theme, 'deprecated', '−', removed.length, removedLabel),
  );

  return flex(
    {
      width: OG_WIDTH,
      height: OG_HEIGHT,
      backgroundColor: theme.paper,
      border: `1px solid ${theme.rule}`,
      padding: 64,
      flexDirection: 'column',
      justifyContent: 'center',
    },
    name,
    roleLine,
    title,
    bottom,
  );
}
