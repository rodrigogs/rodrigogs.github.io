/**
 * View layer: joins curated content (src/content/site.ts) with fetched
 * numbers (Snapshot) into render-ready, locale-specific view models.
 *
 * Pure: no I/O, no globals except the arguments. The site pages and the
 * SVG card renderer both call `buildView`, so the README cards can never
 * say something the site does not.
 */

import type { PackageStat, RepoStat, Snapshot, UpstreamStat } from '../data/schema.ts';
import type { Role } from '../design/tokens.ts';
import {
  about,
  career,
  field,
  fieldOne,
  footer,
  hero,
  ui,
  localeTag,
  meta,
  moreWork,
  person,
  registryLabel,
  sectionOrder,
  sections,
  upstreamCountCommits,
  upstreamNotes,
  work,
  type EntryLink,
  type L,
  type Locale,
  type SectionKey,
  type WorkEntry,
} from '../content/site.ts';
import { bestWeek, compact, contributionWeekStarts, formatInt, snapshotAge } from './derive.ts';

export interface BuildInfo {
  /** Build time. */
  now: Date;
  /** Commit sha, full or short; may be empty locally. */
  sha: string;
}

export interface ProofView {
  value: string;
  label: string;
  href?: string;
}

export interface LinkView {
  kind: EntryLink['kind'];
  label: string;
  href: string;
}

export interface EntryView {
  id: string;
  name: string;
  note: string;
  detail: string;
  stack: string[];
  /** At most two, the most meaningful first (see entryProofs). */
  proofs: ProofView[];
  links: LinkView[];
}

export interface UpstreamView {
  repo: string;
  url: string;
  note: string;
  count: string;
  /** `count` split for typesetting: the figure and its label. */
  countValue: string;
  countLabel: string;
  proofUrl: string;
}

export interface MoreWorkView {
  name: string;
  href: string;
  note: string;
}

export interface CareerView {
  org: string;
  via: string | null;
  title: string;
  from: string;
  to: string;
  /** ISO-ish machine values for <time>. */
  fromDatetime: string;
  toDatetime: string | null;
  current: boolean;
}

export interface HeroNoteView {
  role: Role;
  label: string;
  text: string;
}

export interface SiteView {
  locale: Locale;
  lang: string;
  alternate: { locale: Locale; lang: string; href: string };
  href: string;
  meta: { title: string; description: string };
  person: {
    name: string;
    handle: string;
    email: string;
    github: string;
    linkedin: string | null;
    site: string;
    role: string;
    location: string;
    timezone: string;
    spoken: string;
    since: number;
    years: number;
  };
  nav: { key: SectionKey; label: string; href: string }[];
  hero: {
    title: string;
    notes: HeroNoteView[];
    cta: { email: string; copy: string; copied: string };
  };
  sections: Record<SectionKey, { label: string; claim: string; body?: string }>;
  field: Record<keyof typeof field, string>;
  /** About: the heading, the two paragraphs and the two short lines under them. */
  about: {
    label: string;
    claim: string;
    body: string;
    stack: { label: string; items: readonly string[] };
    aiTools: { label: string; items: readonly string[] };
  };
  work: EntryView[];
  moreWork: { label: string; items: MoreWorkView[] };
  upstream: UpstreamView[];
  career: CareerView[];
  totals: {
    stars: string;
    monthlyDownloads: string;
    contributions: string | null;
    followers: string;
    // --- README cards block (scripts/render-cards.ts) ---
    /** Releases published across the public repos in the snapshot. */
    releases: string;
    /** Contributions per week, the last 53 weeks, oldest first; null when unavailable. */
    contributionWeeks: number[] | null;
    // --- end README cards block ---
  };
  /** README cards block: the contribution year drawn by the skyline card; null when unavailable. */
  contributionYear: ContributionYearView | null;
  // --- Site surface block (src/components): UI strings of the hero, HUD, toast and cheat code ---
  ui: {
    nav: string;
    hud: string;
    time: string;
    contributions: string;
    toast: string;
    toastSub: string;
    cheatOn: string;
    cheatOff: string;
    sign: string;
  };
  // --- end site surface block ---
  footer: {
    built: string;
    data: string;
    stale: string | null;
    staleTag: string;
    source: string;
    sourceHref: string;
    previous: string;
    previousHref: string;
    switchTo: string;
    skip: string;
    top: string;
  };
  jsonLd: Record<string, unknown>;
}

/** DOM id and URL anchor of a section: its key in kebab case (openSource -> open-source). */
export function sectionId(key: SectionKey): string {
  return key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/** Fill `{key}` placeholders. Returns null when any placeholder has no value. */
export function fill(template: string, values: Record<string, string | number | null | undefined>): string | null {
  let missing = false;
  const out = template.replace(/\{(\w+)\}/g, (_, key: string) => {
    const v = values[key];
    if (v === null || v === undefined || v === '') {
      missing = true;
      return '';
    }
    return String(v);
  });
  return missing ? null : out;
}

const t = (value: string | L, locale: Locale): string => (typeof value === 'string' ? value : value[locale]);

function monthYear(value: string, locale: Locale): string {
  const [y, m] = value.split('-').map(Number);
  if (!y) return value;
  if (!m) return String(y);
  return new Intl.DateTimeFormat(localeTag[locale], { month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(Date.UTC(y, m - 1, 1)),
  );
}

function isoDate(value: string, locale: Locale): string {
  return new Intl.DateTimeFormat(localeTag[locale], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
    new Date(value),
  );
}

function relativeDays(days: number, locale: Locale): string {
  return new Intl.RelativeTimeFormat(localeTag[locale], { numeric: 'auto' }).format(-days, 'day');
}

function findPackage(snapshot: Snapshot, ref: WorkEntry['package']): PackageStat | undefined {
  if (!ref) return undefined;
  return snapshot.packages.find((p) => p.registry === ref.registry && p.name === ref.name);
}

/** A counted field label, singular when the count is exactly 1. */
function countLabel(key: keyof typeof field, n: number, locale: Locale): string {
  return ((n === 1 ? fieldOne[key] : undefined) ?? field[key])[locale];
}

/** Link labels: the plain noun, or the registry name for a package ("npm", "crates.io"). */
function linkViews(entry: WorkEntry, locale: Locale): LinkView[] {
  return entry.links.map((link) => {
    if (link.kind !== 'package') return { kind: link.kind, label: field[link.kind][locale], href: link.href };
    if (!entry.package) throw new Error(`work entry "${entry.id}": a package link needs entry.package`);
    return { kind: link.kind, label: registryLabel[entry.package.registry], href: link.href };
  });
}

/**
 * Star counts under this are not shown as proof: a zero or a single star
 * says nothing to a visitor, so the entry leads with its other numbers.
 */
export const MIN_STARS_SHOWN = 5;

function starsProof(repo: RepoStat, locale: Locale): ProofView | null {
  if (repo.stars < MIN_STARS_SHOWN) return null;
  return { value: formatInt(repo.stars, locale), label: countLabel('stars', repo.stars, locale), href: repo.url };
}

/** The best download figure of a package: all-time on crates.io, a year when it is large, else 30 days. */
function downloadsProof(pkg: PackageStat, locale: Locale): ProofView | null {
  if (pkg.registry === 'crates' && pkg.totalDownloads !== null) {
    return { value: compact(pkg.totalDownloads, locale), label: field.downloadsTotal[locale], href: pkg.url };
  }
  if (pkg.yearlyDownloads !== null && pkg.yearlyDownloads >= 10_000) {
    return { value: compact(pkg.yearlyDownloads, locale), label: field.downloadsYear[locale], href: pkg.url };
  }
  if (pkg.monthlyDownloads > 0) {
    return { value: compact(pkg.monthlyDownloads, locale), label: field.downloadsMonth[locale], href: pkg.url };
  }
  return null;
}

/** Proofs shown per entry. More than two numbers per card turns proof into noise. */
export const MAX_PROOFS = 2;

/**
 * The two most meaningful numbers: stars (when there are enough to mean
 * something), then downloads; releases only fill a slot left empty.
 */
function entryProofs(repo: RepoStat, pkg: PackageStat | undefined, locale: Locale): ProofView[] {
  const proofs = [starsProof(repo, locale), pkg ? downloadsProof(pkg, locale) : null].filter((p): p is ProofView => p !== null);
  if (proofs.length < MAX_PROOFS && repo.releaseCount > 0) {
    proofs.push({
      value: formatInt(repo.releaseCount, locale),
      label: countLabel('releases', repo.releaseCount, locale),
      href: `${repo.url}/releases`,
    });
  }
  return proofs.slice(0, MAX_PROOFS);
}

function workView(entry: WorkEntry, snapshot: Snapshot, locale: Locale): EntryView {
  const repo = snapshot.repos.find((r) => r.name === entry.repo);
  // Fail the build loudly rather than render an entry without its proof.
  if (!repo) throw new Error(`work entry "${entry.id}": repo "${entry.repo}" is not in the snapshot`);
  return {
    id: entry.id,
    name: t(entry.name, locale),
    note: entry.note[locale],
    detail: entry.detail[locale],
    stack: entry.stack,
    proofs: entryProofs(repo, findPackage(snapshot, entry.package), locale),
    links: linkViews(entry, locale),
  };
}

/** What counts for an upstream repo: commits where nothing went through the merge button, else merged PRs. */
function upstreamCount(row: UpstreamStat): number {
  return upstreamCountCommits.includes(row.repo) ? row.commits : row.mergedPrs;
}

function upstreamRow(row: UpstreamStat, locale: Locale): UpstreamView | null {
  const countCommits = upstreamCountCommits.includes(row.repo);
  const n = upstreamCount(row);
  if (n <= 0) return null;
  const note = upstreamNotes[row.repo];
  const label = countLabel(countCommits ? 'commits' : 'mergedPrs', n, locale);
  return {
    repo: row.repo,
    url: row.url,
    note: note ? note[locale] : '',
    count: `${formatInt(n, locale)} ${label}`,
    countValue: formatInt(n, locale),
    countLabel: label,
    proofUrl: row.proofUrl,
  };
}

function careerView(locale: Locale): CareerView[] {
  return career.map((role) => ({
    org: role.org,
    via: role.via ?? null,
    title: role.title[locale],
    from: monthYear(role.from, locale),
    to: role.to ? monthYear(role.to, locale) : locale === 'pt' ? 'atual' : 'present',
    fromDatetime: role.from,
    toDatetime: role.to,
    current: role.to === null,
  }));
}

function heroNotes(snapshot: Snapshot, locale: Locale): HeroNoteView[] {
  const wr = snapshot.repos.find((r) => r.name === 'whats-reader');
  const values = {
    stars: wr ? formatInt(wr.stars, locale) : null,
    downloads: wr ? formatInt(wr.releaseDownloads, locale) : null,
  };
  const notes: HeroNoteView[] = [];
  for (const note of hero.notes) {
    const text = fill(note.text[locale], values);
    if (text) notes.push({ role: note.role, label: note.label[locale], text });
  }
  return notes;
}

const pathFor = (locale: Locale) => (locale === 'en' ? '/' : `/${locale}/`);

export function buildView(snapshot: Snapshot, locale: Locale, build: BuildInfo): SiteView {
  const { now, sha } = build;
  const other: Locale = locale === 'en' ? 'pt' : 'en';
  const years = now.getUTCFullYear() - person.since;
  const age = snapshotAge(snapshot, now);
  const failing = Object.values(snapshot.sources).some((s) => !s.ok);
  const oldest = Object.values(snapshot.sources)
    .map((s) => s.lastSuccessAt)
    .filter((v): v is string => Boolean(v))
    .sort()[0];

  const sectionView = {} as SiteView['sections'];
  for (const key of sectionOrder) {
    const s = sections[key] as { label: L; claim: L; body?: L };
    sectionView[key] = {
      label: s.label[locale],
      claim: fill(s.claim[locale], { years }) ?? s.claim[locale],
      ...(s.body ? { body: s.body[locale] } : {}),
    };
  }

  const fieldView = Object.fromEntries(Object.entries(field).map(([k, v]) => [k, v[locale]])) as SiteView['field'];
  const shortSha = sha ? sha.slice(0, 7) : '';

  return {
    locale,
    lang: localeTag[locale],
    alternate: { locale: other, lang: localeTag[other], href: pathFor(other) },
    href: pathFor(locale),
    meta: { title: meta.title[locale], description: meta.description[locale] },
    person: {
      name: person.name,
      handle: person.handle,
      email: person.email,
      github: person.github,
      linkedin: person.linkedin,
      site: person.site,
      role: person.role[locale],
      location: person.location[locale],
      timezone: person.timezone,
      spoken: person.spoken[locale],
      since: person.since,
      years,
    },
    nav: sectionOrder.map((key) => ({ key, label: sections[key].label[locale], href: `#${sectionId(key)}` })),
    hero: {
      title: hero.title[locale],
      notes: heroNotes(snapshot, locale),
      cta: { email: hero.cta.email[locale], copy: hero.cta.copy[locale], copied: hero.cta.copied[locale] },
    },
    sections: sectionView,
    field: fieldView,
    about: {
      label: sections.about.label[locale],
      claim: sections.about.claim[locale],
      body: sections.about.body[locale],
      stack: { label: about.stack.label[locale], items: about.stack.items },
      aiTools: { label: about.aiTools.label[locale], items: about.aiTools.items },
    },
    work: work.map((entry) => workView(entry, snapshot, locale)),
    moreWork: {
      label: moreWork.label[locale],
      items: moreWork.items.map((m) => ({ name: m.name, href: m.href, note: m.note[locale] })),
    },
    // Most landed work first; ties keep the snapshot order.
    upstream: [...snapshot.upstream]
      .sort((a, b) => upstreamCount(b) - upstreamCount(a))
      .map((row) => upstreamRow(row, locale))
      .filter((v): v is UpstreamView => v !== null),
    career: careerView(locale),
    totals: {
      stars: formatInt(snapshot.totals.stars, locale),
      monthlyDownloads: formatInt(snapshot.totals.monthlyDownloads, locale),
      contributions: snapshot.user.contributionsLastYear === null ? null : formatInt(snapshot.user.contributionsLastYear, locale),
      followers: formatInt(snapshot.user.followers, locale),
      // --- README cards block ---
      releases: formatInt(snapshot.repos.reduce((sum, r) => sum + r.releaseCount, 0), locale),
      contributionWeeks: snapshot.user.contributionWeeks ?? null,
      // --- end README cards block ---
    },
    contributionYear: contributionYearView(snapshot, locale),
    // --- Site surface block ---
    ui: {
      nav: ui.nav[locale],
      hud: ui.hud[locale],
      time: fill(ui.time[locale], { tz: person.timezone }) ?? ui.time[locale],
      contributions: ui.contributions[locale],
      toast: ui.toast[locale],
      toastSub: fill(ui.toastSub[locale], { email: person.email }) ?? ui.toastSub[locale],
      cheatOn: ui.cheatOn[locale],
      cheatOff: ui.cheatOff[locale],
      sign: ui.sign[locale],
    },
    // --- end site surface block ---
    footer: {
      built:
        fill(shortSha ? footer.built[locale] : footer.builtNoSha[locale], { date: isoDate(now.toISOString(), locale), sha: shortSha }) ?? '',
      data: fill(footer.data[locale], { age: relativeDays(age.days, locale) }) ?? '',
      stale: failing && oldest ? fill(footer.stale[locale], { date: isoDate(oldest, locale) }) : null,
      staleTag: footer.staleTag[locale],
      source: footer.source[locale],
      sourceHref: 'https://github.com/rodrigogs/rodrigogs.github.io',
      previous: footer.previous[locale],
      previousHref: footer.previousHref,
      switchTo: footer.switchTo[locale],
      skip: footer.skip[locale],
      top: footer.top[locale],
    },
    jsonLd: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: person.name,
      alternateName: person.handle,
      url: person.site,
      email: `mailto:${person.email}`,
      jobTitle: person.role[locale],
      worksFor: { '@type': 'Organization', name: 'Globant' },
      address: { '@type': 'PostalAddress', addressRegion: 'Rio Grande do Sul', addressCountry: 'BR' },
      knowsLanguage: ['pt-BR', 'en'],
      knowsAbout: [...about.stack.items],
      sameAs: [person.github, person.linkedin].filter(Boolean),
    },
  };
}

// ---------------------------------------------------------------------------
// README cards block (scripts/render-cards.ts): the contribution year.
// ---------------------------------------------------------------------------

export interface ContributionYearView {
  /** Contributions per week, oldest first. */
  weeks: number[];
  /** Sunday that starts each week, "YYYY-MM-DD", parallel to `weeks`. */
  weekStarts: string[];
  /** Sum of `weeks` (the drawn weeks, which can differ slightly from the calendar total). */
  total: string;
  totalRaw: number;
  best: { index: number; count: string; countRaw: number; weekOf: string } | null;
}

function contributionYearView(snapshot: Snapshot, locale: Locale): ContributionYearView | null {
  const weeks = snapshot.user.contributionWeeks;
  if (!weeks || weeks.length === 0) return null;
  const weekStarts = contributionWeekStarts(snapshot.fetchedAt, weeks.length);
  const totalRaw = weeks.reduce((sum, n) => sum + n, 0);
  const top = bestWeek(weeks);
  return {
    weeks: [...weeks],
    weekStarts,
    total: formatInt(totalRaw, locale),
    totalRaw,
    best: top
      ? {
          index: top.index,
          count: formatInt(top.count, locale),
          countRaw: top.count,
          weekOf: new Intl.DateTimeFormat(localeTag[locale], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(
            new Date(`${weekStarts[top.index]}T00:00:00Z`),
          ),
        }
      : null,
  };
}
