---
name: Rodrigo Gomes — Release History
description: A personal site read as a Keep a Changelog entry, where every claim is a dated, linked release.
colors:
  paper: "#FAFBFC"
  sheet: "#FFFFFF"
  ink: "#12161D"
  ink-2: "#3E4552"
  ink-3: "#5D6573"
  rule: "#DDE1E7"
  added: "#127543"
  on-added: "#FFFFFF"
  added-tint: "#E3F4EA"
  changed: "#F2B71F"
  on-changed: "#12161D"
  changed-tint: "#FDF3D6"
  merged: "#2447D6"
  on-merged: "#FFFFFF"
  merged-tint: "#E4EAFD"
  deprecated: "#BF361B"
  on-deprecated: "#FFFFFF"
  deprecated-tint: "#FBE6E0"
typography:
  display:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw, 6rem)"
    fontWeight: 900
    fontVariation: "font-stretch: 125% (expanded)"
    lineHeight: 0.92
    letterSpacing: "-0.025em"
  display-name:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 6vw - 0.375rem, 4.25rem)"
    fontWeight: 900
    fontVariation: "font-stretch: 125% (expanded)"
    lineHeight: 0.94
    letterSpacing: "-0.025em"
  display-close:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(2rem, 1rem + 3.6vw, 4rem)"
    fontWeight: 900
    fontVariation: "font-stretch: 125% (expanded)"
    lineHeight: 1
    letterSpacing: "-0.025em"
  display-email:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 0.6rem + 3vw, 3rem)"
    fontWeight: 800
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "clamp(1.5rem, 3.2vw, 2.25rem)"
    fontWeight: 900
    fontVariation: "font-stretch: 125% (expanded)"
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    fontVariation: "font-stretch: 125% (expanded)"
    lineHeight: 2rem
    letterSpacing: "-0.015em"
  body:
    fontFamily: "Archivo, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    fontVariation: "font-stretch: 100% (normal)"
    lineHeight: 1.5
  label:
    fontFamily: "Martian Mono, ui-monospace, monospace"
    fontSize: "0.8125em"
    fontWeight: 600
    letterSpacing: "-0.01em"
rounded:
  hairline: "1px"
  rule: "2px"
  sm: "2px"
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
    backgroundColor: "{colors.merged}"
    textColor: "{colors.on-merged}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  plate-deprecated:
    backgroundColor: "{colors.deprecated}"
    textColor: "{colors.on-deprecated}"
    rounded: "{rounded.sm}"
    padding: "0 8px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sm}"
    padding: "0 24px"
    height: "48px"
---

# Design System: Rodrigo Gomes — Release History

## Overview

**Creative North Star: "The Living Changelog"**

The site reads its own owner's work as software: dated entries, a diffstat and a compare view, on the bright, near-clinical white sheet of a real release page — not a portfolio pretending to be one. The whole palette is four release roles (Added, Changed, Merged, Deprecated) applied only as solid tag plates, tinted diff lines and diffstat blocks; there is no fifth decorative accent. Archivo's width axis does the work other systems give to a second typeface: expanded and black for names, titles and section nouns, normal weight for running prose, while Martian Mono is held in reserve for anything that is data — versions, dates, hashes, counts, diff numbers.

The changelog grammar describes the *work* — versioned software entries, their diffstat, their compare view — never the person. Every label the visitor reads about Rodrigo himself is a plain professional noun: **Role**, **Product** and **Open source** on the three hero note plates; **AI engineering** and **Stack** as section nouns; **Since** and **Status** as entry fields. The hero carries no CalVer date and no "Latest" plate — a person is not a software release, and the owner confirmed that framing read badly (2026-09-28). The README masthead and OG social cards follow the same rule: a solid green plate still sits beside the name, in the same role and position a "Latest" plate would have used, but it now names the site (`rodrigogs.github.io`), not a fake release date.

Density is editorial-technical: hairline rules separate every entry, a left rail carries status and dates the way a git log carries metadata, and every section opens with one literal noun as its heading (AI engineering, Work, Open source, Packages, Career, Stack, Contact) followed by exactly one claim sentence. The system explicitly refuses the dev-portfolio default (hero imagery, bento-grid cards, skill-badge walls, dark neon glow) and its editorial-serif opposite; nothing here is illustrative or ornamental. The retired 2026 "vaporwave" palette (cyan/yellow/magenta/pink) exists only behind the Konami-code easter egg (`:root[data-theme='vaporwave']`) as evidence of personality — it is a swapped token set for the same four roles, not a second design system, and it never appears in normal navigation.

**Key Characteristics:**
- Four release-role colors are the entire color system; no neutral accent beyond ink/paper.
- Archivo's width axis (expanded ↔ normal) substitutes for a second display face.
- Martian Mono is reserved exclusively for versions, dates, hashes, counts and diff numbers.
- Square-cornered plates and a 4px whole-unit spacing grid; no soft or generous rounding anywhere.
- Flat by default: no ambient shadows; the only `box-shadow` uses are inset focus rings, radio "knob" fills and the transient `:target` highlight glow.

## Colors

The palette is the four Keep-a-Changelog roles, each a solid, AA-checked pair of role color and on-role text, plus a light tint for diff backgrounds. There is no separate "brand" accent: the role colors are the brand.

### Primary
- **Added Green** (`#127543`, text `#FFFFFF`, tint `#E3F4EA`): shipped/active work, the site plate in the README and OG masthead, `+` diff lines and diffstat blocks.
- **Changed Amber** (`#F2B71F`, text `#12161D`, tint `#FDF3D6`): the AI engineering field's full-bleed band, the current job on the career rail, the text-selection color, the focus ring inside `.field-ink` regions.
- **Merged Cobalt** (`#2447D6`, text `#FFFFFF`, tint `#E4EAFD`): open-source contributions to other people's projects; also the site-wide default focus-ring color (`--focus: var(--c-merged)`).
- **Deprecated Vermilion** (`#BF361B`, text `#FFFFFF`, tint `#FBE6E0`): legacy/retired work, `−` diff lines and diffstat blocks.

### Neutral
- **Paper** (`#FAFBFC`): page ground.
- **Sheet** (`#FFFFFF`): raised bands (`.field-sheet`), entry cards.
- **Ink** (`#12161D`): primary text, default focus outline on paper, default link color.
- **Ink 2** (`#3E4552`): secondary text (release notes, entry detail).
- **Ink 3** (`#5D6573`): meta text — dates, counts, captions, legacy-entry text.
- **Rule** (`#DDE1E7`): hairline dividers between entries and sections.

All values above are the light theme, the frontmatter-normative source. A dark theme exists (`prefers-color-scheme: dark`, e.g. paper `#0F1216`, ink `#EEF1F5`, added `#3CC97C`) as a straight token swap of the same six neutral + four role slots — never a separate visual system.

### Named Rules
**The Four Roles Rule.** The entire color system is four release roles (Added, Changed, Merged, Deprecated). A new surface must map its states onto these four before reaching for a new color; there is no fifth accent to invent.

**The Solid Plate Rule.** Role colors render only as solid tag plates, diff-line tints, and diffstat blocks — never as decorative gradients, glows, or large color fields outside these three forms.

## Typography

**Display/Headline/Title Font:** Archivo (expanded width, `font-stretch: 125%`), with system-ui/sans-serif fallback.
**Body Font:** Archivo (normal width, `font-stretch: 100%`).
**Label/Mono Font:** Martian Mono (`ui-monospace`, monospace fallback), reserved for data.

**Character:** One typeface family carries the whole system across its width axis instead of pairing a display serif with a body sans; Martian Mono is the sole second voice, and it only ever speaks numbers.

### Hierarchy
- **Display** (900, `clamp(2rem, 6vw, 6rem)`, line-height 0.92, `-0.025em`, expanded 125%): the base display class.
- **Display name** (900, `clamp(2rem, 6vw - 0.375rem, 4.25rem)`, line-height 0.94, expanded 125%): the owner's name, H1 in the hero, sized so "Rodrigo Gomes" holds one line in seven columns (up to `clamp(2rem, 9vw, 4.25rem)` once the hero stacks).
- **Display close** (900, `clamp(2rem, 1rem + 3.6vw, 4rem)`, expanded 125%): the Contact headline and the 404 title (`clamp(2.25rem, 1rem + 3.5vw, 4rem)`).
- **Display email** (800, `clamp(1.25rem, 0.6rem + 3vw, 3rem)`): the email address set large in the Contact close.
- **Headline / Section title** (900, `clamp(1.5rem, 3.2vw, 2.25rem)`, line-height 1.1, `-0.02em`, expanded 125%): the literal-noun section heading (AI engineering, Work, Career, Stack, etc.).
- **Title** (800, 1.5rem/2rem, `-0.015em`, expanded 125%): entry names inside a release or project list.
- **Claim** (600, `clamp(1.25rem, 2.2vw, 1.5rem)`, line-height 1.34, max 34–42ch): the one claim sentence that opens each section and the hero release title.
- **Body** (400, 1rem, line-height 1.5): running prose, entry notes and detail.
- **Label/Meta** (600, `0.75rem`, line-height 1rem): field labels (`dt`), micro captions.
- **Mono/data** (Martian Mono, `0.8125em`, tabular-nums + slashed-zero): version numerals, dates, hashes, version tags, diff counts.

### Named Rules
**The Data Voice Rule.** Anything that is a measured quantity — a version, date, hash, count, or diff number — renders in Martian Mono with tabular figures. Archivo never carries a number that stands for a proof.

**The Width-Axis Rule.** Emphasis is expressed by moving Archivo's width axis to expanded/black (names, titles, headings, plates), never by switching typeface or adding a second display face.

## Layout

A strict 12-column grid (`.grid`, `column-gap: var(--gutter)` = 24px) inside a max-width sheet (`--max` = 1280px, fluid inline padding `clamp(16px, 4vw, 48px)`). Below 48rem the grid collapses to a single column and every grid child spans full width. The hero splits 7/5 (release copy left, career rail + Compare right); entries split a 3-column metadata rail against a 9-column body via CSS subgrid. The AI engineering section is a dedicated full-bleed `.field-changed` band: two-up agent-project entries first, then a four-up capabilities grid below them.

Vertical rhythm runs on a single 4px unit (`--s-1` … `--s-11`: 4/8/12/16/24/32/48/64/96/128/192px) — every block snaps to a whole step; nothing in the build uses a fractional or off-scale spacing value. Entries stack with a 1px hairline rule between them (`border-block-start`), not a shadow or a card boundary.

## Elevation & Depth

The system is flat by default; depth is conveyed by ink weight, tint fields and rule lines, not by shadow. The only `box-shadow` uses in the entire build are: (1) inset rings that fill the Compare rail's radio "knobs" on selection, (2) the default focus-visible outline (`outline`, not shadow), and (3) the transient glow on a `:target`-linked permalink entry, which fades within 1.8s and is disabled under reduced motion.

### Named Rules
**The Flat Ledger Rule.** Surfaces never lift on hover or elevate on interaction. The only state changes are color (background/text) and the hairline-bounded fields (`.field-changed`, `.field-merged`, `.field-ink`) that recolor an entire section band to a role color.

## Shapes

Square corners throughout: the shared radius token is 2px (`--radius`, from `shape.radius`), applied to plates and action buttons alike — legible as a printed tag, not a soft rounded UI chip. Hairlines are 1px; the heavier rule weight (2px) marks emphasis (the "Unreleased/compare" range border, nav underline). There is no card border beyond the entry hairline and the `.field-sheet` top/bottom 1px rule; nothing is clipped into a rounded container.

## Components

### Buttons ("Action plates")
- **Shape:** square-cornered (2px radius), 1px border in the current text color.
- **Primary:** filled with the current foreground color (`--fg`, ink on paper by default), text in the ground color, min-height 48px (`--s-7`), horizontal padding 16–24px.
- **Ghost/quiet:** transparent fill, border in `--c-rule` instead of `--fg`.
- **Hover:** background tints toward foreground/ground mix (`color-mix`); no shadow, no scale transform.

### Plates (signature tag component)
- **Shape:** square-cornered (2px radius), fixed height (24–32px depending on `size`), inline-flex with a leading gap for an icon/mono value.
- **Color assignment:** `data-role` selects one of the four role fills with its AA-paired on-role text; `data-inverse` swaps fill and text for a plate sitting on its own role-colored field.
- **Usage:** the hero note plates (each carrying a plain label — Role, Product, Open source — never a jargon term), entry status, section-head tags, diff icons, and the green site plate on the README/OG masthead (`rodrigogs.github.io`, replacing the retired CalVer "Latest" plate) — always a role tag with a plain-language or literal value, never a free-standing decorative color chip.

### Cards / Entries
- **Corner style:** none (no radius) — an entry is a horizontal band, not a boxed card.
- **Background:** paper/sheet; legacy entries desaturate their name/note/tag to ink-3 and swap the timeline node to an outlined (not filled) square.
- **Shadow strategy:** none (see Elevation & Depth).
- **Border:** 1px hairline rule above each entry only.
- **Internal padding:** vertical `--s-6` (32px); metadata rail padded `--s-6` from the timeline node.
- **Metadata fields:** `Since` (when the project started) and `Latest release` (version tag) on the rail; `Status` reads `Active`, `Maintained`, `Legacy`, `Private, live` or `In progress` — never the old "Dormant" wording.

### Inputs / Fields
- **Style (Compare rail "knobs"):** square, 20px, no radius, layered inset box-shadows simulating a ring rather than a native radio appearance.
- **Focus:** the shared `:focus-visible` 2px outline in the current focus color (role-dependent inside colored fields).
- **Selected state:** knob fills solid with its assigned role color (Added for "To", Deprecated for "From").

### Navigation
- **Style:** sticky top bar, paper background, 1px bottom hairline; nav links are ink-2, moving to ink with a 2px underline that animates in via `scaleX` on hover/`aria-current`.
- **Section nouns:** AI engineering, Work, Open source, Packages, Career, Stack, Contact — plain professional nouns, never a changelog term borrowed from software release notes.
- **Mobile:** the nav row breaks onto its own scrollable strip below the wordmark/language switch, no radius change, same hairline language.

### AI engineering (signature component)
A dedicated full-bleed amber (`.field-changed`) band holding two things the "Now"/"Unreleased" section used to split apart: the agent-infrastructure projects (two-up entries, each with a permalink, proofs and links) and, below them, the "What I can do" capabilities grid (moved out of Stack) — name, one sentence, and a link where there is public proof. One section, one plain noun heading, one claim sentence.

### Compare (signature component)
The URL-addressable diff view: pick two years on the career rail's radio "knobs" and the readout re-renders a GitHub-style five-block diffstat plus an added/removed line list (Added-green / Deprecated-vermilion tints), capped at 10 lines behind a disclosure. It is the one authored motion in the system: a `cubic-bezier(0.16, 1, 0.3, 1)` ease-out at 160/320/560ms (fast/base/slow), used for the range highlight sliding on the rail and the strike-through/fade when a diff line leaves.

## Do's and Don'ts

### Do:
- **Do** keep the palette to the four release roles (Added/Changed/Merged/Deprecated); a new surface reuses these before adding a color.
- **Do** render every measured quantity (version, date, hash, count) in Martian Mono with tabular numerals.
- **Do** use Archivo's width axis (expanded/black for emphasis, normal for prose) instead of a second typeface.
- **Do** open each section with its literal plain-noun heading and exactly one claim sentence.
- **Do** keep corners square (2px radius token) and depth flat; state changes are color, not shadow or lift.
- **Do** label anything that describes the person — hero notes, section nouns, entry fields, status words — with a plain professional noun (Role, Product, Open source, AI engineering, Stack, Since, Status, Legacy). The changelog grammar (roles, plates, diffstat, compare) stays; changelog *vocabulary* aimed at the person does not.
- **Do** embed a provenance `tEXt` chunk (key `impeccable:prompt`) in every shipped OG PNG, naming it as code-rendered, not generated.

### Don't:
- **Don't** add a decorative accent color outside the four release roles.
- **Don't** apply role colors as gradients, glows, or large ambient fields; they render only as plates, diff tints and diffstat blocks.
- **Don't** add hard offset/neobrutalist shadows, drop shadows, or elevation on hover — this world is flat by construction.
- **Don't** carry the retired vaporwave palette (Konami easter egg) into normal navigation or any new component; it is a swapped token set behind an easter egg, not a usable system palette.
- **Don't** introduce kickers/eyebrows above headings; the section noun itself is the heading (`SectionHead`'s literal-label rule), with no small label sitting above it.
- **Don't** reintroduce a CalVer date or a "Latest" plate on the hero, or any changelog noun ("Now", "Unreleased", "Changed"/"Added" as a status word, "Dormant", "Born") as a label describing the person; that jargon read as a defect on a person's site and was replaced with plain nouns (Role, Product, Open source, AI engineering, Stack, Since, Legacy) — it is not a style to bring back for a new surface.
