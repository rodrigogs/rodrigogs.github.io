---
name: Rodrigo Gomes — 1986 Miami Night
description: A night drive through 1986 Miami rendered as a console-menu UI, where every neon number still links to its proof.
colors:
  night: "#0E0826"
  panel: "#1C1440"
  rule: "#3A2C72"
  ink: "#FFF6FB"
  ink-2: "#E4D6FF"
  ink-3: "#B8A6E6"
  brand: "#FF6EC7"
  on-brand: "#1A0526"
  select: "#00FF97"
  on-select: "#04140C"
  added: "#00D9FF"
  on-added: "#06101F"
  added-tint: "#062A3A"
  changed: "#FFEA00"
  on-changed: "#1A1400"
  changed-tint: "#2E2A06"
  merged: "#BD00FF"
  merged-text: "#D580FF"
  on-merged: "#FFFFFF"
  merged-tint: "#2A0A40"
  deprecated: "#FF8C42"
  on-deprecated: "#1A0800"
  deprecated-tint: "#3A1A0A"
typography:
  script:
    fontFamily: "Yellowtail, cursive"
    fontSize: "clamp(3.5rem, 1.6rem + 5.2vw, 6rem)"
    fontWeight: 400
    lineHeight: 1.1
  display:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "clamp(2.5rem, 0.6rem + 4.3vw, 5.25rem)"
    fontWeight: 400
    lineHeight: 1
    letterSpacing: "0.02em"
  section-title:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "clamp(2.25rem, 1.3rem + 3.4vw, 4rem)"
    fontWeight: 400
    lineHeight: 1
  toast-title:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "clamp(2.75rem, 1rem + 7vw, 6rem)"
    fontWeight: 400
    lineHeight: 1
  card-title:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 1.2rem + 1.4vw, 2.5rem)"
    fontWeight: 400
    lineHeight: 1
  claim:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.125rem, 1rem + 0.5vw, 1.375rem)"
    fontWeight: 500
    lineHeight: 1.45
  role:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "clamp(1.1875rem, 1rem + 0.7vw, 1.5rem)"
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 700
  hud:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
    letterSpacing: "0.02em"
  micro:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    letterSpacing: "0.14em"
  small:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
  meta:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 800
  data:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
  lead:
    fontFamily: "Inter, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 700
  stat:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "1.375rem"
    fontWeight: 800
  station-title:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "1.75rem"
    fontWeight: 400
  tuner-digit:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "1.625rem"
    fontWeight: 800
  method-num:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "2.25rem"
    fontWeight: 800
  clock:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "2.5rem"
    fontWeight: 800
  code-404:
    fontFamily: "Luckiest Guy, system-ui, sans-serif"
    fontSize: "2rem"
    fontWeight: 400
  email:
    fontFamily: "Orbitron, system-ui, sans-serif"
    fontSize: "clamp(1rem, 0.6rem + 1.6vw, 1.75rem)"
    fontWeight: 700
rounded:
  hairline: "1px"
  link: "3px"
  diff: "2px"
  sm: "4px"
  chip: "6px"
  screen: "8px"
  action: "10px"
  frame: "14px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
  "11": "192px"
components:
  plate-added:
    backgroundColor: "{colors.added}"
    textColor: "{colors.on-added}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  plate-changed:
    backgroundColor: "{colors.changed}"
    textColor: "{colors.on-changed}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  plate-merged:
    backgroundColor: "{colors.merged-text}"
    textColor: "{colors.night}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  plate-deprecated:
    backgroundColor: "{colors.deprecated}"
    textColor: "{colors.on-deprecated}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  action-primary:
    backgroundColor: "{colors.brand}"
    textColor: "{colors.on-brand}"
    rounded: "{rounded.action}"
    padding: "0 24px"
    height: "48px"
  action-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.action}"
    padding: "0 24px"
    height: "48px"
  action-primary-hover:
    backgroundColor: "{colors.select}"
    textColor: "{colors.on-select}"
---

# Design System: Rodrigo Gomes — 1986 Miami Night

## Overview

**Creative North Star: "The Pause Menu Over the Sunset"**

The site is a night drive through 1986 Miami: a live WebGL sunset over the ocean, palm and Art Deco silhouettes, and the real work — proof, numbers, a career, a stack — laid over it as a console-menu UI, an owner-pinned homage to the era's console crime games (PRODUCT.md, "Pinned aesthetic"). It is a brief-pinned world, not a rolled one: every neon color, both display faces, the menu-frame geometry and the green selection bar existed as a decision before the build and now exist as shipped tokens in `src/design/tokens.ts`, read by the CSS, the WebGL shader, and the GitHub-profile README card renderer alike, so the site and the README cannot drift apart.

The system draws a hard line between two registers. The **scene and its frame furniture** are unapologetically game-menu: a brush-script signature, an outlined display face with a hard drop, HUD numerals with no panel, thick-bordered tilted frames, a radio tuner, a toast stamp, scanlines, and a chromatic glitch that fires on hover. The **content read as prose** — every claim about the person — stays plain: Role, Product, AI, Work, Open source, Packages, Career, Stack, Contact are literal professional nouns, never changelog or game jargon. Game vocabulary is UI flavor only (a toast, a cheat, a tuner), never a claim about him. One color, a synthetic green (`#00FF97`) absent from the vaporwave four, is the single selection state across the whole system: every hover, focus ring, and current nav item uses it and nothing else, exactly as the pause menus it pays homage to use one highlight color.

Homage, not copy is load-bearing, not decorative: no Rockstar/Take-Two marks, no "Grand Theft Auto"/"Vice City" branding, no game art, no extracted game fonts (Pricedown's license forbids webfont embedding), no radio names or audio. Every shape (the tilted menu frame, the sliced-sun scene, the four typefaces, the icon set) is drawn from the site's own SVG, shader and font choices.

**Key Characteristics:**
- One selection color (`#00FF97`) for every hover, focus and current-item state; no other color plays that role.
- Four faces, four jobs: Yellowtail script (the name only), Luckiest Guy outlined display (titles, big numbers, never body), Inter (everything read), Orbitron (HUD numerals and readouts, no panel).
- Menu frames are thick dark-bordered panels tilted ±0.5deg like a framed postcard; HUD readouts float with no panel at all — an icon plus an outlined colored number.
- A single 4px spacing unit; every block snaps to a whole step (`--s-1`…`--s-11`).
- Plain professional nouns label the person; game vocabulary (toast, cheat, tuner, "STATION") stays confined to UI flavor on the signature interactions, never to a section heading or a claim about him.

## Colors

The palette is the owner's own vaporwave four plus one dedicated selection color; there is no fifth decorative accent beyond the ones with an assigned role.

### Primary
- **Hot Pink (Brand)** (`#FF6EC7`): the name (Yellowtail script), the primary "Email me" action, the neon sign on Contact, the glitch's pink channel. The brand color, used sparingly and always on type or a filled primary action.
- **Cyan (Added)** (`#00D9FF`): the HUD clock, product/download stats, `+` diff lines and diffstat blocks, the Packages download bars, the tuner's LCD digits.
- **Sun Yellow (Changed)** (`#FFEA00`): the current career role, the "Role" hero note plate, the sun's core gradient stop.
- **Violet (Merged)** (`#BD00FF`, text form `#D580FF` — violet is too dark for text on the night): AI/open-source work, stack chip backgrounds (tinted), the AI project proof numerals.
- **Sunset Orange (Deprecated)** (`#FF8C42`): legacy/retired work, `−` diff lines and diffstat blocks.

### Named Rules
**The One Selection Color Rule.** `#00FF97` (green) is the only hover, focus-visible and current-item color anywhere in the system. Every `:hover`, `:focus-visible` and `[aria-current]`/`[data-current]` state resolves to this one color, never to brand pink or any role color, as in the menus this world pays homage to.

### Neutral
- **Night** (`#0E0826`): page ground, the sky's base and the scene's water-near tone.
- **Panel** (`#1C1440`): menu-frame fill, the sticky pause-menu bar, table listing frames.
- **Rule** (`#3A2C72`): hairlines between entries and inside listings.
- **Ink** (`#FFF6FB`): primary text, display-title fill.
- **Ink 2** (`#E4D6FF`): secondary text (claims, notes, career titles).
- **Ink 3** (`#B8A6E6`): meta text — dates, captions, "where" line.

All values are the single `night` theme (`src/design/tokens.ts`); the world has no daytime variant. Every text pair is checked against WCAG 2.2 AA on `night` and `panel`.

## Typography

**Script Font:** Yellowtail (cursive fallback) — the name only, nowhere else.
**Display Font:** Luckiest Guy (system-ui fallback) — titles, big numbers, the toast stamp; always white ink with a heavy dark outline and a hard drop, never body text.
**Body Font:** Inter (system-ui sans-serif fallback) — everything read: claims, notes, entries, labels, UI copy.
**HUD Font:** Orbitron (system-ui fallback) — numerals and short readouts only: the clock, stat counters, the tuner's year digits, career dates, package figures. Always tabular-nums.

**Character:** A brush-script signature and a heavy outlined display face carry the game-menu register; Inter carries every sentence a hiring manager actually reads; Orbitron is reserved for anything that is a live or measured number, so the HUD reads as instrumentation, not decoration.

### Hierarchy
- **Script** (400, `clamp(3.5rem, 1.6rem + 5.2vw, 6rem)`, line-height 1.1): the first name only, in the hero lockup and the Contact neon sign (`clamp(3.5rem, 2rem + 6vw, 6rem)` there).
- **Display** (400, `clamp(2.5rem, 0.6rem + 4.3vw, 5.25rem)`, line-height 1, `0.02em`, outlined + hard drop): the surname in the hero lockup, all uppercase.
- **Section title** (400, `clamp(2.25rem, 1.3rem + 3.4vw, 4rem)`): every section's plain-noun heading (`SectionHead`), the Contact heading, the 404 title.
- **Card title** (400, `clamp(1.75rem, 1.2rem + 1.4vw, 2.5rem)`): a Work/Open-source entry's name, set over its own loading-screen scene.
- **Toast title** (400, `clamp(2.75rem, 1rem + 7vw, 6rem)`, skewed −10deg): the copy-email stamp only.
- **Claim** (500, `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`, line-height 1.45, max 46ch): the one sentence under every section heading and the hero role line's sibling text.
- **Role** (600, `clamp(1.1875rem, 1rem + 0.7vw, 1.5rem)`, line-height 1.35): the hero's job-title line.
- **Body** (400, 1.0625rem base, line-height 1.6): running prose — entry notes, detail, hints.
- **Label** (700, 0.875rem, uppercase, `0.08–0.14em` tracking): frame-corner labels ("STATION"), group labels, plate text.
- **HUD numeral** (800, tabular-nums, outlined, no panel): the clock, stat counts, tuner years, career dates, package figures — always `--hud` (Orbitron).

### Named Rules
**The Outline Rule.** Every display-face title and every HUD numeral carries a heavy dark outline (`-webkit-text-stroke` in `var(--outline)`, a darkened night) with `paint-order: stroke fill`, so white or neon type stays legible directly over the scene with no background panel underneath it.

**The HUD-Has-No-Panel Rule.** HUD readouts (the clock, the stat counters, the tuner digits) are never set inside a bordered panel or card. They are an icon and an outlined colored number floating straight over the scene or the night — the outline alone carries legibility, as on the console HUDs this world pays homage to.

## Layout

A 12-column grid (`.grid`, `column-gap: var(--gutter)` = 24px) inside a max-width sheet (`--max` = 1280px, fluid inline padding `clamp(var(--s-4), 4vw, var(--s-7))`, i.e. 16px–48px). Below 48rem the grid collapses to one column. The hero splits into a left text column and a right HUD/scene column; below 64rem the scene becomes a height-bound band (`--scene-h`) and the HUD moves to a narrow column left of the sun. The Stack section splits 7/5 (manifest / Compare tuner), collapsing to one column below 64rem.

Vertical rhythm runs on a single 4px unit (`--s-1`…`--s-11`: 4/8/12/16/24/32/48/64/96/128/192px); sections use a fluid multiple of this scale for their block padding (`.band`, `clamp(var(--s-8), 9vw, var(--s-10))`). Menu frames pad on `clamp(var(--s-5), 3vw, var(--s-7))`. A career "boardwalk" timeline runs a two-rail plank motif down its own left gutter; work/open-source entries are menu frames with a "loading screen" strip on top.

## Elevation & Depth

The system is not flat: menu frames are deliberately raised panels with a thick dark border, an inset hairline, and a soft ambient drop shadow (`var(--shadow)`: `0 1.25rem 2.5rem -1rem` at 70% black) — read as a physical console panel floating on the night, not a card lifting on hover. Depth is otherwise conveyed by glow, not lift: neon text-shadows (`--glow-pink`, `--glow-cyan`) sit behind brand/HUD type and the sun's silhouette-scene elements, and interactive elements never translate or scale on hover — only their color changes to the selection green.

### Shadow Vocabulary
- **Frame shadow** (`var(--shadow)`: `0 1.25rem 2.5rem -1rem rgba(0,0,0,0.7)`): every menu frame (`.frame::before`), the pause-menu bar and its open panel.
- **Glow-pink / glow-cyan** (`color-mix` at ~50–55% of brand/added): text-shadow behind the script signature, HUD clock, and the toast stamp; also the sun-slice drop-shadow on entry "loading screens".
- **Action shadow** (`0 0.5rem 1rem -0.5rem rgba(0,0,0,0.7)`): the small ambient lift under filled `.action` buttons, dropped for `.action-ghost`.
- **Compare-bar glow** (`0 0 0.6rem var(--glow-cyan)`): the Packages download-share bar and the tuner readouts.

### Named Rules
**The No-Lift-On-Hover Rule.** Nothing translates, scales, or gains a new shadow on hover or focus. State change is color only — to the one selection green — matching the menu-select behavior this world pays homage to. (`.action:active` is the sole exception: a 1px press-down translate, not a hover effect.)

## Shapes

Two coexisting form languages, by design: **menu frames** (10px hairline, but a thick 4px dark border, 14px corner radius, and a deliberate ±0.5deg tilt on the backdrop only — text inside stays straight and sharp) for anything presented as a console panel — the AI-workflow method, the compare tuner, the pause-menu header, the package listing, work/open-source cards, 404. **Small controls** use a tighter, calmer radius scale: 4px for plates and diff-line tints, 6px for chips and small nav/menu links, 10px for actions, dial rows and the "+N more" disclosure, 999px for pill chips and the Packages download bar. Circles appear once, deliberately: the 50%-radius career timeline node.

## Components

### Actions (buttons)
- **Shape:** 10px radius, 3px solid dark-outline border (`var(--outline)`), min-height 48px.
- **Primary:** filled brand pink, `on-brand` ink-dark text, set in the display face at 1.1875rem — the "Email me" CTA on Hero and Contact.
- **Ghost:** transparent fill over the scene/night, `--c-rule` border, no ambient shadow — GitHub/LinkedIn links.
- **Hover / Focus:** background and text swap to the one selection green (`--c-select`/`--c-on-select`); `:active` presses down 1px. No scale, no new shadow.

### Plates (role tag)
- **Shape:** 4px radius, fixed 1.5rem height, Orbitron/HUD face, uppercase, tight tracking.
- **Color assignment:** `data-role` selects one of the four role fills (added/cyan, changed/yellow, merged/violet-text, deprecated/orange) with its on-role text.
- **Usage:** hero note labels (Role, Product, AI — plain nouns only), entry status, the career "current role" tag, diff-line icons by proxy of role color.

### Menu Frame (signature component)
- **Shape:** thick 4px dark border, 14px radius, ±0.5deg tilt on the backdrop layer, inset 1px hairline plus the ambient frame shadow.
- **Usage:** the AI-workflow method panel, the Compare tuner, work/open-source/package entries, the pause-menu header and its mobile overlay, the 404 card.
- **Corner label:** an optional small uppercase Orbitron tag in the frame's corner ("STATION", the method label) — a station-display flourish that belongs to the frame furniture itself, not a heading kicker; it is never applied above a `SectionHead` title.

### Cards / Entries
- **Corner style:** menu-frame radius (14px) with an inner 8px-radius "loading screen" strip on top (a small night sky with a sliced sun at its right edge, never behind the title).
- **Background:** panel fill; the screen strip uses the scene gradient tokens directly so entry and hero share one sky.
- **Shadow strategy:** frame shadow only (see Elevation & Depth); the sun slice carries its own pink glow.
- **Internal padding:** `--s-3`/`--s-6` around the screen, `--s-4` on the body.

### Inputs / Fields (Compare radio tuner)
- **Style:** an LCD-strip dial (`◄ 2015 ►`) inside a 10px-radius, 3px-bordered row; Orbitron digits in cyan with a cyan text-glow.
- **Focus:** the shared selection-green background/text swap, offset inward (`outline-offset: -3px`) so it reads inside the dial row.
- **Disabled (no-JS default):** the dials render the server-computed default range and are visually identical but inert, so the diff reads correctly with scripts off.

### Navigation (pause menu)
- **Style:** a floating menu-frame bar; the script handle plus plain-noun links in pink Luckiest Guy, sticky at the top.
- **Default/hover/active:** links are pink; hover and `aria-current` both resolve to the one selection-green bar.
- **Mobile (< 70rem):** the row folds behind a compact "MENU" toggle (pause-bar icon) that opens the nouns as an overlay panel under the frame, dimming the page behind it; without scripts the row stays a single horizontally-scrolling strip.

### HUD readout (signature component)
No panel: an icon plus an outlined, role-colored Orbitron number set directly over the scene (the hero's live local-time clock and stats: stars, monthly downloads, yearly contributions, each linking to its proof). Hover swaps the whole readout to the selection-green pill; the outline disappears since the fill already contrasts.

### Toast (signature component)
A full-viewport, un-boxed stamp: giant skewed pink Luckiest Guy title ("EMAIL COPIED!") with a small Orbitron subtitle, on a soft radial dusk behind it (not a box), animated in with a 1.6s scale/blur-in and hold. Reduced motion drops the animation but keeps the stamp state.

### Cheat easter egg (signature component)
Typing the code "VAPORWAVE" swaps the scene's floor to the owner's original vaporwave perspective grid (`vaporwave` tokens; the grid only renders while the WebGL canvas is off or as a CSS floor layer) and flashes a small Orbitron "CHEAT ACTIVATED" line for ~2.4s (`src/scripts/cheat.ts`, `Cheat.astro`).

## Do's and Don'ts

### Do:
- **Do** keep `#00FF97` (green) as the only hover/focus/current-item color across the whole system; a new surface reuses it before reaching for any other state color.
- **Do** hold Yellowtail to the name only, Luckiest Guy to titles/numbers/the toast (always outlined + hard drop, never body copy), Inter to everything read, and Orbitron to numerals and readouts only.
- **Do** label anything describing the person with a plain professional noun (Role, Product, AI, Work, Open source, Packages, Career, Stack, Contact); confine game vocabulary (toast, cheat, tuner, "STATION") to UI flavor on the signature interactions, never to a section heading or a claim about him.
- **Do** set HUD readouts with no panel — an icon and an outlined colored number straight over the scene or the night.
- **Do** keep the scene's performance budget: hero JS under 5KB gzip, no three.js/bloom/ray-marching/particles, capped DPR, paused offscreen/hidden-tab, a still frame under reduced motion, and WebGL context loss handled by falling back to the always-present SVG poster.
- **Do** snap every block to the 4px spacing scale (`--s-1`…`--s-11`); nothing in the build uses an off-scale spacing value.

### Don't:
- **Don't** use a second color for hover, focus, or "current" state; every such state resolves to the one selection green.
- **Don't** apply changelog vocabulary ("Now", "Unreleased", CalVer dates, "Latest" plates) to the person — this is a Miami-night console world, not a release ledger, and that jargon was already rejected once for a prior world; it does not belong in this one either.
- **Don't** add a hard-offset neobrutalist box-shadow anywhere; the "hard drop" that exists on display titles and the toast stamp is a `text-shadow` on the display/HUD faces specifically, pinned by the direction contract — it is not a general-purpose shadow device for new components.
- **Don't** promote a frame's corner label ("STATION") into a kicker/eyebrow sitting above a `SectionHead` title; it belongs to the menu-frame furniture, never to the section-heading pattern (which stays one literal noun, then one claim sentence, no label above it).
- **Don't** use Rockstar/Take-Two marks, the words "Grand Theft Auto" or "Vice City" as branding, game art or screenshots, fonts extracted from the game (Pricedown is never webfont-embedded — its license forbids it), or radio station names/audio; this world is built only from its own SVG, shader and font choices (PRODUCT.md, "Homage, not copy").
- **Don't** lift, scale, or add a new shadow on hover; state change is color-only (see The No-Lift-On-Hover Rule).
