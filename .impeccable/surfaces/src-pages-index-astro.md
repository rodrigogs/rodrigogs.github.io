---
version: 1
slug: "src-pages-index-astro"
primary_target: "src/pages/index.astro"
related_targets: []
---

# Surface brief: home (rodrigogs.github.io)

Scope: the one-page site at `/` (EN) and `/pt/` (PT-BR), plus the GitHub profile README as a sibling surface in the same world. Visitor mode: **Persuade**. Build path: code-led (no image generation on this machine).

Audience and job: hiring managers, tech leads and technical recruiters for senior/staff roles. They decide in under a minute, then verify depth. Actions: email (copy or mailto), LinkedIn, GitHub. Proof: fetched GitHub/npm/crates.io numbers, public repos, upstream contributions, public LinkedIn timeline. Constraints: PRODUCT.md (public work only, plain labels, homage-not-copy).

## Direction contract

THESIS: The site is a night drive through 1986 Miami. Neon over a pink sunset, palms and Art Deco, with a game-menu UI laid over the real work, so it is memorable. Every number still links to its proof, so it is credible. It refuses the sober editorial portfolio the owner rejected and the amateur neon template (glitch everywhere, unreadable mono body, fake stats).

OWN-WORLD:
- Palette: a deep indigo night (#0E0826) with the owner's neon four. Pink #FF6EC7 is the brand, cyan #00D9FF, sun yellow #FFEA00 and violet #BD00FF, plus sunset orange #FF8C42. One green, #00FF97, is the only selection color: every hover, focus and current item uses it, as in the menus this pays homage to.
- Type: a Yellowtail pink brush-script signature, Luckiest Guy titles in white with a heavy dark outline and a hard drop, Inter for everything you read, and Orbitron for HUD numerals.
- Geometry: menu frames are thick-bordered panels floating on the night, slightly tilted like a framed postcard. HUD readouts have no panel: an icon and a colored number with a dark outline, set straight over the scene.
- Texture: subtle CRT scanlines, and a chromatic glitch that fires on hover only.

STORY: In one screen the visitor knows three things: he is a senior engineer shipping since 2010, he works with a team of AI agents in a disciplined way, and the work is real and used. They believe it because the numbers link out. Then they email or open LinkedIn.

FIRST VIEWPORT:
- Background: a full-bleed live scene. A raw-WebGL fragment shader draws the sky gradient, a sliced sun sitting at about 68% x, stars and a shimmering ocean reflection. Inline SVG layers on top carry the Art Deco skyline with neon edges and the palm silhouettes. An SVG poster is the first paint and the fallback.
- Left side, on a scrim: the signature lockup. "Rodrigo" in pink Yellowtail sits over "GOMES DA SILVA" in outlined Luckiest Guy, followed by the role line, three HUD-style notes (Role, Product, AI) and the actions: "Email me" as the primary pink plate, Copy address, then GitHub and LinkedIn.
- Top-right HUD: Rodrigo's live local time in cyan Orbitron (UTC−3) and real stats (stars, npm downloads a month, contributions a year). Each stat is an icon plus a number, with no panel.
- The nav is a pause menu: pink labels, and a green bar under the current or hovered item.

FORM: A 1986 Miami night drive with a console-menu UI. It is a brief-pinned world (owner request), not a rolled one. The signature interactions are three:
- the living scene;
- Compare as a radio tuner ("◄ 2014 ► … ◄ 2026 ►") inside a menu frame, diffing the stack between any two years;
- the toast: copying the email stamps a big unboxed pink "EMAIL COPIED!" with a small white subtitle, like a mission screen in our own words.

The easter egg is a typed cheat code ("VAPORWAVE") that brings back the owner's original vaporwave perspective grid over the ocean, with a small "CHEAT ACTIVATED" line.

RULES:
- Readability first. Body text is Inter at 16 to 18px on solid or scrimmed night, AA contrast everywhere, and never text over the sun.
- Decoration is layered where content is not. The scene lives in the hero, and every section below is a menu frame or a clean night band.
- Marks encode real quantities: HUD numbers, the skyline heights in the README and the diffstat.
- One highlight color for all selection states (green).
- Plain labels for the person (Role, Product, AI, Work, Open source, Stack, Contact). Game vocabulary appears only as UI flavor (a toast, a cheat, a tuner), never as claims about him.
- Performance: hero JS under 5 KB gzip, no three.js, no bloom, no ray marching, no particles. DPR is capped, rendering pauses offscreen and on hidden tabs, reduced motion gets a still frame, and context loss is handled.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved

- There is no CV/PDF, so the site does not offer one.
