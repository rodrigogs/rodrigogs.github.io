# Product

<!-- impeccable:product-schema 1 -->

> Interview note: the owner answered one structured round (audience, URL, sensitive repos), then asked for no further questions ("não me pergunta nada, só faz research, decide e aplica"). Facts marked *(inferred)* come from research on 2026-09-28 (GitHub, npm and crates.io APIs, the owner's public LinkedIn as mirrored in his notes, and live checks), not from a direct answer.

## Platform

web

## Stack

delegated: Astro (static output) with TypeScript, deployed to GitHub Pages from the `rodrigogs.github.io` user-site repo through GitHub Actions. GitHub, npm and crates.io data are fetched at build time, and a daily scheduled rebuild keeps the numbers live. The same build renders the SVG cards embedded in the GitHub profile README (`rodrigogs/rodrigogs`), so the site and the README share one data pipeline and one visual system. Chosen because the site is content-first (case studies, timeline, bilingual copy) and must score well on performance and SEO with no client-side API calls.

## Users

Primary: engineering managers, tech leads and technical recruiters hiring for senior or staff full-stack roles, remote and often international. They arrive from a job application, LinkedIn or the GitHub profile, usually on a laptop during working hours, with other candidates open in nearby tabs. Their job is to decide in under a minute whether this engineer is worth a call, then to verify depth in the parts they care about (a repo, a product, a timeline). (Confirmed: "Vagas senior/staff".)

Secondary *(inferred)*: Brazilian companies and peers who prefer Portuguese, and open source users landing from a package or repo.

## Product Purpose

The personal site and GitHub profile of Rodrigo Gomes da Silva (GitHub `rodrigogs`). It exists to turn a skim into a conversation: show who he is, what he builds, and proof that it is used, then make contact one action away. Success is a qualified hiring conversation started from the site or profile.

## Positioning

An engineer shipping since 2010 and senior since 2018 *(public LinkedIn)* who builds whole products end to end and whose claims are checkable: software people actually install and download (about 21k npm downloads a month, 1.5k+ GitHub stars, a desktop app with 90+ releases), live products in regulated or demanding domains (cardiac CT planning in the browser, a repair-shop SaaS), and current work on AI agent infrastructure upstream in Hermes Agent. The mechanism a neighbor cannot copy: the range runs from MySQL binlog change data capture and resumable Postgres COPY streaming to on-device Whisper over WebGPU and multi-agent orchestration, and every piece has a public artifact behind it.

## Operating Context

- Visitors come from GitHub (profile README, pinned repos), LinkedIn, job applications and package pages.
- They verify through repos, npm and crates.io pages, live product sites and the GitHub contribution graph.
- The GitHub profile README renders under GitHub's markdown sanitizer: no custom CSS or JS, images through the camo proxy, light and dark themes via `<picture>` and `prefers-color-scheme`.
- Existing project sites on the same host keep working: `rodrigogs.github.io/whats-reader/`, `rodrigogs.github.io/kairos/`. The old site path `rodrigogs.github.io/rodrigogs/` redirects to the root.

## Capabilities and Constraints

- Static site, no backend. Contact is email (`rodrigo.smscom@gmail.com`, already public) plus GitHub and LinkedIn.
- Numbers shown must be real and fetched, never hardcoded placeholders. If a fetch fails, the build keeps the last committed snapshot and says when it was taken.
- Languages: English primary, Brazilian Portuguese available *(inferred decision; the owner is Brazilian and targets international roles)*.
- Private repos with public products (tavia, pitstop, trama) are shown through their public product sites or as private work, never with repo links.
- Adult-site scraper libraries (xvideos, pornhub, sxyprn) are shown neutrally as scraping/API client libraries, not hidden and not featured as flagships. (Confirmed: "Mostrar de forma neutra".)
- Tooling and AI stack are listed from verified usage. Employer-internal projects, client names beyond what LinkedIn already shows, hostnames, IPs and secrets are never published.

## Brand Commitments

- Name: Rodrigo Gomes da Silva; handle `rodrigogs`.
- Voice *(inferred)*: plain, first person, specific, no hype, no emoji bullets; numbers and artifacts instead of adjectives.
- The previous vaporwave identity is retired (treated as evidence of personality: fun, technical, a Konami code easter egg), not carried forward as a visual system.

## Evidence on Hand

All fetched on 2026-09-28; raw data in `/tmp/rg-profile/` during the build, then committed as the build snapshot.

- Career timeline (public LinkedIn): Secullum (2010–2012), Safetech (2011–2015, Java/Grails, NF-e), Stefanini (2015–2016), ntxdev (2016–2017), Involves (2017–2018), Meltwater (2018–2020), Stilingue (2021–2022), Globant (2022–present) on Warner Bros. Discovery (2022–2025) and Disney Entertainment (2025–present) accounts. Based in Rio Grande do Sul, Brazil. Portuguese native, English fluent.
- Flagships: whats-reader (272★, 93 releases, 7k release downloads, local Whisper over WebGPU after a one-time model download, 10 README languages), @rodrigogs/mysql-events (139★, 77k downloads a year), easyvpn (519★), pg-turbo, vibewatch (Rust, crates.io, 187 tests, 91% coverage), baileys-store (151 tests), hermes-smart-router (1,959 tests, 100% branch coverage), kairos, mongoose-timezone (24k downloads a year).
- Live products: taviacardio.com (TAVI planning from CT angiography), pitstop.sh (repair-shop management SaaS).
- Upstream: contributor to NousResearch/hermes-agent (5 commits landed upstream, 40 PRs opened), 5 merged PRs to nesquena/hermes-webui, earlier merged PRs to Rocket.Chat and moleculer.
- Impact story: barracao-digital, a virtual queue for COVID-19 screening centers (site offline; tell it as a story, link the repo).
- Excluded everywhere: `ilsap` (a DMCA-disabled repo; its stars are not counted) and trivial list-entry PRs (InternetSemLimites).
- Absences future work must not fabricate: no testimonials, no talks, no blog posts, no company logos used as endorsements, no salary or availability claims, no merged-PR claims for hermes-agent (its commits were cherry-picked by the maintainer), no "senior since 2010" (first senior title: 2018), no Discord/Slack claims for the self-hosted gateway (only Telegram is live).

## Product Principles

1. Proof over claims: every number links to where it can be checked.
2. Current work leads; classics give social proof but do not pose as current.
3. One minute to decide, depth on demand: a skim path and a verify path through the same page.
4. Live data, honest fallbacks: stale numbers say how old they are.
5. The README and the site are one system: same data, same voice, same visual world.

## Accessibility & Inclusion

WCAG 2.2 AA: contrast, keyboard paths, visible focus, reduced motion respected, semantic landmarks. Must read well on a mid-range laptop and on a phone.
