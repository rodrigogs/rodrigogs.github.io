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
    fontSize: "clamp(1.625rem, 1.2rem + 1vw, 2.125rem)"
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
  sm: "4px"
  chip: "6px"
  screen: "8px"
  action: "10px"
  frame: "14px"
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

The site is a night drive through 1986 Miami: a live WebGL sunset over the ocean, palm and Art Deco silhouettes, a car and a plane crossing the scene, and the real work — who he is, six projects with their numbers, open source, a career — laid over it as a console-menu UI, an owner-pinned homage to the era's console crime games (PRODUCT.md, "Pinned aesthetic"). It is a brief-pinned world, not a rolled one: every neon color, both display faces, the menu-frame geometry and the green selection bar existed as a decision before the build and now exist as shipped tokens in `src/design/tokens.ts`, read by the CSS, the WebGL shader, and the GitHub-profile README card renderer alike, so the site and the README cannot drift apart.

The system draws a hard line between two registers. The **scene and its frame furniture** are unapologetically game-menu: a brush-script signature, an outlined display face with a hard drop, HUD numerals with no panel, thick-bordered tilted frames, a toast stamp, scanlines, and a chromatic glitch that fires on hover. The **content read as prose** — every claim about the person — stays plain and short, as a senior engineer's page should: About, Work, Open source, Career, Contact are literal professional nouns, never changelog or game jargon, and nothing below the hero is a gimmick widget (no tool-chip walls, no status plates, no package table, no numbered method). Game vocabulary is UI flavor only (a toast, a cheat), never a claim about him. One color, a synthetic green (`#00FF97`) absent from the vaporwave four, is the single selection state across the whole system: every hover, focus ring, and current nav item uses it and nothing else, exactly as the pause menus it pays homage to use one highlight color.

Homage, not copy is load-bearing, not decorative: no Rockstar/Take-Two marks, no "Grand Theft Auto"/"Vice City" branding, no game art, no extracted game fonts (Pricedown's license forbids webfont embedding), no radio names or audio. Every shape (the tilted menu frame, the sliced-sun scene, the four typefaces, the icon set) is drawn from the site's own SVG, shader and font choices.

**Key Characteristics:**
- One selection color (`#00FF97`) for every hover, focus and current-item state; no other color plays that role.
- Four faces, four jobs: Yellowtail script (the name only), Luckiest Guy outlined display (titles, big numbers, never body), Inter (everything read), Orbitron (HUD numerals and readouts, no panel).
- Menu frames are thick dark-bordered panels tilted ±0.5deg like a framed postcard; HUD readouts float with no panel at all — an icon plus an outlined colored number.
- A single 4px spacing unit; every block snaps to a whole step (`--s-1`…`--s-11`).
- Plain professional nouns label the person; game vocabulary (toast, cheat) stays confined to UI flavor on the signature interactions, never to a section heading or a claim about him.
- The hero background moves, gently: palms sway from their feet, a neon car drives the causeway, a plane crosses the sun, the water shimmers and the stars twinkle. Below the hero the night is still, but for a faint light drifting along each section's neon divider.

## Colors

The palette is the owner's own vaporwave four plus one dedicated selection color; there is no fifth decorative accent beyond the ones with an assigned role.

### Primary
- **Hot Pink (Brand)** (`#FF6EC7`): the name (Yellowtail script), the primary "Email me" action, the neon sign on Contact, the glitch's pink channel. The brand color, used sparingly and always on type or a filled primary action.
- **Cyan (Added)** (`#00D9FF`): the HUD clock, the contributions stat, the Contact email, the "Product" hero note plate, the car's side stripe and light trail.
- **Sun Yellow (Changed)** (`#FFEA00`): the current career role, the "Role" hero note plate, work proof numerals, the sun's core gradient stop.
- **Violet (Merged)** (`#BD00FF`, text form `#D580FF` — violet is too dark for text on the night): the "AI" hero note plate, the open-source counts, the menu frames' top tint.
- **Sunset Orange (Deprecated)** (`#FF8C42`): the stale-data plate in the footer only.

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
**HUD Font:** Orbitron (system-ui fallback) — numerals and short readouts only: the clock, stat counters, proof numbers, career dates. Always tabular-nums.

**Character:** A brush-script signature and a heavy outlined display face carry the game-menu register; Inter carries every sentence a hiring manager actually reads; Orbitron is reserved for anything that is a live or measured number, so the HUD reads as instrumentation, not decoration.

### Hierarchy
- **Script** (400, `clamp(3.5rem, 1.6rem + 5.2vw, 6rem)`, line-height 1.1): the first name only, in the hero lockup and the Contact neon sign (`clamp(3.5rem, 2rem + 6vw, 6rem)` there).
- **Display** (400, `clamp(2.5rem, 0.6rem + 4.3vw, 5.25rem)`, line-height 1, `0.02em`, outlined + hard drop): the surname in the hero lockup, all uppercase.
- **Section title** (400, `clamp(2.25rem, 1.3rem + 3.4vw, 4rem)`): every section's plain-noun heading (`SectionHead`), the Contact heading, the 404 title.
- **Card title** (400, `clamp(1.625rem, 1.2rem + 1vw, 2.125rem)`): a featured project's name at the top of its menu frame.
- **Toast title** (400, `clamp(2.75rem, 1rem + 7vw, 6rem)`, skewed −10deg): the copy-email stamp only.
- **Claim** (500, `clamp(1.125rem, 1rem + 0.5vw, 1.375rem)`, line-height 1.45, max 46ch): the one sentence under every section heading and the hero role line's sibling text.
- **Role** (600, `clamp(1.1875rem, 1rem + 0.7vw, 1.5rem)`, line-height 1.35): the hero's job-title line.
- **Body** (400, 1.0625rem base, line-height 1.6): running prose — the About paragraphs (1.125rem, max 40rem), entry notes; an entry's detail and the open-source notes step down to 1rem.
- **Label** (700, 0.875rem, uppercase, `0.08–0.14em` tracking): plate text.
- **HUD numeral** (800, tabular-nums, outlined, no panel): the clock, stat counts, proof numbers, career dates — always `--hud` (Orbitron).

### Named Rules
**The Outline Rule.** Every display-face title and every HUD numeral carries a heavy dark outline (`-webkit-text-stroke` in `var(--outline)`, a darkened night) with `paint-order: stroke fill`, so white or neon type stays legible directly over the scene with no background panel underneath it.

**The HUD-Has-No-Panel Rule.** HUD readouts (the clock, the stat counters) are never set inside a bordered panel or card. They are an icon and an outlined colored number floating straight over the scene or the night — the outline alone carries legibility, as on the console HUDs this world pays homage to.

## Layout

A max-width sheet (`.wrap`, `--max` = 1280px, fluid inline padding `clamp(var(--s-4), 4vw, var(--s-7))`, i.e. 16px–48px); each section lays out its own simple grid inside it. The hero splits into a left text column and a right HUD/scene column; below 64rem the scene becomes a height-bound band (`--scene-h`) and the HUD moves to a narrow column left of the sun. About sets its two paragraphs at a 40rem measure with the Stack and AI-tools lines beside them (stacked below 64rem). Work is a 2-column grid of six menu frames (one column below 48rem) followed by one "Also:" line of smaller work.

Vertical rhythm runs on a single 4px unit (`--s-1`…`--s-11`: 4/8/12/16/24/32/48/64/96/128/192px); sections use a fluid multiple of this scale for their block padding (`.band`, `clamp(var(--s-8), 9vw, var(--s-10))`). Menu frames pad on `clamp(var(--s-5), 3vw, var(--s-7))`. A career "boardwalk" timeline runs a two-rail plank motif down its own left gutter; open source is one menu frame of compact rows (repository, count, one line).

## Elevation & Depth

The system is not flat: menu frames are deliberately raised panels with a thick dark border, an inset hairline, and a soft ambient drop shadow (`var(--shadow)`: `0 1.25rem 2.5rem -1rem` at 70% black) — read as a physical console panel floating on the night, not a card lifting on hover. Depth is otherwise conveyed by glow, not lift: neon text-shadows (`--glow-pink`, `--glow-cyan`) sit behind brand/HUD type and the sun's silhouette-scene elements, and interactive elements never translate or scale on hover — only their color changes to the selection green.

### Shadow Vocabulary
- **Frame shadow** (`var(--shadow)`: `0 1.25rem 2.5rem -1rem rgba(0,0,0,0.7)`): every menu frame (`.frame::before`), the pause-menu bar and its open panel.
- **Glow-pink / glow-cyan** (`color-mix` at ~50–55% of brand/added): text-shadow behind the script signature, HUD clock, the Contact sign and email, and the toast stamp; the drifting light on section dividers.
- **Action shadow** (`0 0.5rem 1rem -0.5rem rgba(0,0,0,0.7)`): the small ambient lift under filled `.action` buttons, dropped for `.action-ghost`.

### Named Rules
**The No-Lift-On-Hover Rule.** Nothing translates, scales, or gains a new shadow on hover or focus. State change is color only — to the one selection green — matching the menu-select behavior this world pays homage to. (`.action:active` is the sole exception: a 1px press-down translate, not a hover effect.)

## Shapes

Two coexisting form languages, by design: **menu frames** (10px hairline, but a thick 4px dark border, 14px corner radius, and a deliberate ±0.5deg tilt on the backdrop only — text inside stays straight and sharp) for anything presented as a console panel — the pause-menu header, the six work cards, the open-source list, 404. **Small controls** use a tighter, calmer radius scale: 4px for plates, 6px for small nav/menu links, 10px for actions. Circles appear once, deliberately: the 50%-radius career timeline node.

## Components

### Actions (buttons)
- **Shape:** 10px radius, 3px solid dark-outline border (`var(--outline)`), min-height 48px.
- **Primary:** filled brand pink, `on-brand` ink-dark text, set in the display face at 1.1875rem — the "Email me" CTA on Hero and Contact.
- **Ghost:** transparent fill over the scene/night, `--c-rule` border, no ambient shadow — GitHub/LinkedIn links.
- **Hover / Focus:** background and text swap to the one selection green (`--c-select`/`--c-on-select`); `:active` presses down 1px. No scale, no new shadow.

### Plates (role tag)
- **Shape:** 4px radius, fixed 1.5rem height, Orbitron/HUD face, uppercase, tight tracking.
- **Color assignment:** `data-role` selects one of the four role fills (added/cyan, changed/yellow, merged/violet-text, deprecated/orange) with its on-role text.
- **Usage:** hero note labels (Role, Product, AI — plain nouns only) and the footer's stale-data tag. Never a status on a project ("Legacy" on a working library says nothing true).

### Menu Frame (signature component)
- **Shape:** thick 4px dark border, 14px radius, ±0.5deg tilt on the backdrop layer, inset 1px hairline plus the ambient frame shadow.
- **Usage:** the six work cards, the open-source list, the pause-menu header and its mobile overlay, the 404 card.

### Cards / Entries
- **Content, top to bottom:** the name (card title, with a permalink), one sentence on what it does, the short detail at 1rem, then on the card's floor at most two proof numbers (stars when there are at least 5, then downloads; releases only fill an empty slot), three or four technologies as plain text between middots, and the links (the package link is named by its registry: npm, crates.io).
- **No decoration per card:** no sun strip, no status plate, no "since"/"latest release" row; the world lives in the frame and the hero.
- **Shadow strategy:** frame shadow only (see Elevation & Depth).

### About
Two plain first-person paragraphs (Inter, 1.125rem, 40rem measure), then two short lines as plain inline lists: "Stack:" and "AI tools I use daily:". No chips, no pills, no numbered method.

### Navigation (pause menu)
- **Style:** a floating menu-frame bar; the script handle plus plain-noun links in pink Luckiest Guy, sticky at the top.
- **Default/hover/active:** links are pink; hover and `aria-current` both resolve to the one selection-green bar.
- **Mobile (< 70rem):** the row folds behind a compact "MENU" toggle (pause-bar icon) that opens the nouns as an overlay panel under the frame, dimming the page behind it; without scripts the row stays a single horizontally-scrolling strip.

### HUD readout (signature component)
No panel: an icon plus an outlined, role-colored Orbitron number set directly over the scene (the hero's live local-time clock and stats: stars, monthly downloads, yearly contributions, each linking to its proof). Hover swaps the whole readout to the selection-green pill; the outline disappears since the fill already contrasts.

### Toast (signature component)
A full-viewport, un-boxed stamp: giant skewed pink Luckiest Guy title ("EMAIL COPIED!") with a small Orbitron subtitle, on a soft radial dusk behind it (not a box), animated in with a 1.6s scale/blur-in and hold. Reduced motion drops the animation but keeps the stamp state.

### Hero motion (signature component)
The scene moves, gently, within the budget. The shader keeps the sun slices drifting, the stars twinkling and the water shimmering. Over it, CSS moves small SVG layers by transform only (compositor-friendly, no layout, no repaint of the scene): four palms sway ±1.3–1.7° from their feet on 6.3–8.6 s ease-in-out alternate loops with different phases; a neon car (our own 1980s wedge silhouette, cyan side stripe, glowing tail light, pink and cyan light trails) drives the causeway left to right every 17 s, passing behind the palm trunks; a small plane with a blinking red beacon and white strobes crosses the upper half of the sun right to left every 31 s. The actors pause while the hero is off screen. Under reduced motion none of them run: the car and the plane stay off stage, the palms stand still, and the shader shows its still frame.

Below the hero, each section's neon divider carries a faint light drifting along it (19–23 s, one small transformed pseudo-element per band), off under reduced motion.

### Cheat easter egg (signature component)
Typing the code "VAPORWAVE" swaps the scene's floor to the owner's original vaporwave perspective grid (`vaporwave` tokens; the grid only renders while the WebGL canvas is off or as a CSS floor layer) and flashes a small Orbitron "CHEAT ACTIVATED" line for ~2.4s (`src/scripts/cheat.ts`, `Cheat.astro`).

## Do's and Don'ts

### Do:
- **Do** keep `#00FF97` (green) as the only hover/focus/current-item color across the whole system; a new surface reuses it before reaching for any other state color.
- **Do** hold Yellowtail to the name only, Luckiest Guy to titles/numbers/the toast (always outlined + hard drop, never body copy), Inter to everything read, and Orbitron to numerals and readouts only.
- **Do** label anything describing the person with a plain professional noun (Role, Product, AI, About, Work, Open source, Career, Contact); confine game vocabulary (toast, cheat) to UI flavor on the signature interactions, never to a section heading or a claim about him.
- **Do** set HUD readouts with no panel — an icon and an outlined colored number straight over the scene or the night.
- **Do** keep the scene's performance budget: hero JS under 5KB gzip, no three.js/bloom/ray-marching/particles, capped DPR, paused offscreen/hidden-tab, a still frame under reduced motion, and WebGL context loss handled by falling back to the always-present SVG poster. Anything else that moves in the scene is a small layer animated by `transform` or `opacity` only.
- **Do** snap every block to the 4px spacing scale (`--s-1`…`--s-11`); nothing in the build uses an off-scale spacing value.

### Don't:
- **Don't** use a second color for hover, focus, or "current" state; every such state resolves to the one selection green.
- **Don't** apply changelog vocabulary ("Now", "Unreleased", CalVer dates, "Latest" plates) to the person — this is a Miami-night console world, not a release ledger, and that jargon was already rejected once for a prior world; it does not belong in this one either.
- **Don't** add a hard-offset neobrutalist box-shadow anywhere; the "hard drop" that exists on display titles and the toast stamp is a `text-shadow` on the display/HUD faces specifically, pinned by the direction contract — it is not a general-purpose shadow device for new components.
- **Don't** put a kicker/eyebrow above a section title; a section opens with one literal noun, then one claim sentence.
- **Don't** bring back gimmick widgets below the hero: tool-chip walls, status plates, package tables, stack tuners, numbered methods or "this site was built this way" claims (PRODUCT.md, "Good sense over machinery").
- **Don't** use Rockstar/Take-Two marks, the words "Grand Theft Auto" or "Vice City" as branding, game art or screenshots, fonts extracted from the game (Pricedown is never webfont-embedded — its license forbids it), or radio station names/audio; this world is built only from its own SVG, shader and font choices (PRODUCT.md, "Homage, not copy").
- **Don't** lift, scale, or add a new shadow on hover; state change is color-only (see The No-Lift-On-Hover Rule).
