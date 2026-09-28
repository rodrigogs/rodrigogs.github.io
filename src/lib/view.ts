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
  career,
  careerStack,
  compare,
  field,
  fieldOne,
  footer,
  hero,
  konami,
  localeTag,
  meta,
  now as nowEntries,
  person,
  roleLabel,
  sectionOrder,
  sections,
  status as statusVocab,
  toolchain,
  upstreamCountCommits,
  upstreamNotes,
  work,
  type EntryLink,
  type Fact,
  type L,
  type Locale,
  type SectionKey,
  type StatusKey,
  type WorkEntry,
} from '../content/site.ts';
import { compact, diffStacks, formatInt, snapshotAge, stackByYear } from './derive.ts';

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
  status: StatusKey;
  statusLabel: string;
  statusRole: Role;
  born: number | null;
  latest: { tag: string; date: string | null; href: string | null } | null;
  note: string;
  detail: string;
  stack: string[];
  proofs: ProofView[];
  links: LinkView[];
  isPrivate: boolean;
}

export interface NowView {
  id: string;
  name: string;
  note: string;
  proofs: ProofView[];
  links: LinkView[];
  isPrivate: boolean;
}

export interface UpstreamView {
  repo: string;
  url: string;
  stars: string;
  starsRaw: number;
  note: string;
  count: string;
  /** `count` split for typesetting: the figure and its label. */
  countValue: string;
  countLabel: string;
  proofUrl: string;
  years: string;
  highlights: { title: string; url: string; date: string }[];
}

export interface PackageView {
  registry: PackageStat['registry'];
  name: string;
  url: string;
  version: string | null;
  monthly: string;
  monthlyRaw: number;
}

export interface CareerView {
  org: string;
  via: string | null;
  title: string;
  note: string | null;
  from: string;
  to: string;
  /** ISO-ish machine values for <time>. */
  fromDatetime: string;
  toDatetime: string | null;
  current: boolean;
  startYear: number;
  endYear: number;
}

export interface CompareData {
  years: number[];
  stackByYear: Record<number, string[]>;
  base: number;
  head: number;
  initial: { added: string[]; removed: string[]; kept: string[] };
  /** createdAt year of every public non-fork repo, for the "repos started" count. */
  repoYears: number[];
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
    calver: string;
    calverDatetime: string;
    latestLabel: string;
    title: string;
    notes: HeroNoteView[];
    cta: { email: string; copy: string; copied: string };
  };
  sections: Record<SectionKey, { label: string; claim: string; tag?: string; body?: string }>;
  roleLabel: Record<Role, string>;
  field: Record<keyof typeof field, string>;
  now: NowView[];
  work: EntryView[];
  upstream: UpstreamView[];
  packages: PackageView[];
  career: CareerView[];
  compare: {
    label: string;
    hint: string;
    base: string;
    head: string;
    added: string;
    addedOne: string;
    removed: string;
    removedOne: string;
    kept: string;
    keptOne: string;
    work: string;
    workOne: string;
    data: CompareData;
  };
  toolchain: {
    ships: { label: string; items: readonly string[] };
    groups: { label: string; items: readonly string[] }[];
    skillsLabel: string;
    skills: { name: string; text: string; href: string | null }[];
  };
  totals: {
    stars: string;
    repos: string;
    monthlyDownloads: string;
    packages: string;
    contributions: string | null;
    followers: string;
  };
  konami: { label: string };
  footer: {
    built: string;
    data: string;
    stale: string | null;
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

const DAY = 86_400_000;

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

function calver(d: Date): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getUTCFullYear()}.${p(d.getUTCMonth() + 1)}.${p(d.getUTCDate())}`;
}

function relativeDays(days: number, locale: Locale): string {
  return new Intl.RelativeTimeFormat(localeTag[locale], { numeric: 'auto' }).format(-days, 'day');
}

/** Status of a public repo from its last push: active < 6 months, maintained < 2 years, else dormant. */
export function repoStatus(repo: RepoStat, now: Date): StatusKey {
  const age = (now.getTime() - new Date(repo.pushedAt).getTime()) / DAY;
  if (age <= 183) return 'latest';
  if (age <= 730) return 'maintained';
  return 'dormant';
}

function findPackage(snapshot: Snapshot, ref: WorkEntry['package']): PackageStat | undefined {
  if (!ref) return undefined;
  return snapshot.packages.find((p) => p.registry === ref.registry && p.name === ref.name);
}

/** A counted field label, singular when the count is exactly 1. */
function countLabel(key: keyof typeof field, n: number, locale: Locale): string {
  return ((n === 1 ? fieldOne[key] : undefined) ?? field[key])[locale];
}

const linkLabel: Record<EntryLink['kind'], keyof typeof field> = {
  repo: 'repo',
  site: 'site',
  demo: 'demo',
  package: 'package',
  docs: 'docs',
  commits: 'commitsLink',
};

function linkViews(links: EntryLink[], locale: Locale): LinkView[] {
  return links.map((link) => ({ kind: link.kind, label: field[linkLabel[link.kind]][locale], href: link.href }));
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

function factProof(fact: Fact, locale: Locale): ProofView {
  return { value: `${formatInt(fact.value, locale)}${fact.unit ?? ''}`, label: fact.label[locale] };
}

function entryProofs(repo: RepoStat | undefined, pkg: PackageStat | undefined, facts: WorkEntry['facts'], locale: Locale): ProofView[] {
  const proofs: ProofView[] = [];
  const stars = repo ? starsProof(repo, locale) : null;
  if (stars) proofs.push(stars);
  if (pkg) {
    if (pkg.registry === 'crates' && pkg.totalDownloads !== null) {
      proofs.push({ value: compact(pkg.totalDownloads, locale), label: field.downloadsTotal[locale], href: pkg.url });
    } else if (pkg.yearlyDownloads !== null && pkg.yearlyDownloads >= 10_000) {
      proofs.push({ value: compact(pkg.yearlyDownloads, locale), label: field.downloadsYear[locale], href: pkg.url });
    } else if (pkg.monthlyDownloads > 0) {
      proofs.push({ value: compact(pkg.monthlyDownloads, locale), label: field.downloadsMonth[locale], href: pkg.url });
    }
  }
  if (repo && repo.releaseCount > 0) {
    proofs.push({ value: formatInt(repo.releaseCount, locale), label: countLabel('releases', repo.releaseCount, locale), href: `${repo.url}/releases` });
  }
  if (repo && repo.releaseDownloads > 0) {
    proofs.push({
      value: compact(repo.releaseDownloads, locale),
      label: countLabel('releaseDownloads', repo.releaseDownloads, locale),
      href: `${repo.url}/releases`,
    });
  }
  for (const fact of facts ?? []) proofs.push(factProof(fact, locale));
  return proofs;
}

function workView(entry: WorkEntry, snapshot: Snapshot, locale: Locale, now: Date): EntryView {
  const repo = entry.repo ? snapshot.repos.find((r) => r.name === entry.repo) : undefined;
  const pkg = findPackage(snapshot, entry.package);
  const st: StatusKey = entry.status ?? (repo ? repoStatus(repo, now) : 'private');
  const latest = repo?.latestRelease
    ? { tag: repo.latestRelease.tag, date: isoDate(repo.latestRelease.publishedAt, locale), href: repo.latestRelease.url }
    : pkg?.version
      ? { tag: `v${pkg.version.replace(/^v/, '')}`, date: null, href: pkg.url }
      : null;
  return {
    id: entry.id,
    name: t(entry.name, locale),
    status: st,
    statusLabel: statusVocab[st].label[locale],
    statusRole: statusVocab[st].role,
    born: repo ? new Date(repo.createdAt).getUTCFullYear() : (entry.born ?? null),
    latest,
    note: entry.note[locale],
    detail: entry.detail[locale],
    stack: entry.stack,
    proofs: entryProofs(repo, pkg, entry.facts, locale),
    links: linkViews(entry.links, locale),
    isPrivate: !entry.repo,
  };
}

function upstreamRow(row: UpstreamStat, locale: Locale): UpstreamView | null {
  const countCommits = upstreamCountCommits.includes(row.repo);
  const n = countCommits ? row.commits : row.mergedPrs;
  if (n <= 0) return null;
  const note = upstreamNotes[row.repo];
  const first = row.firstAt ? new Date(row.firstAt).getUTCFullYear() : null;
  const last = row.lastAt ? new Date(row.lastAt).getUTCFullYear() : null;
  return {
    repo: row.repo,
    url: row.url,
    stars: compact(row.stars, locale),
    starsRaw: row.stars,
    note: note ? note[locale] : '',
    count: `${formatInt(n, locale)} ${countLabel(countCommits ? 'commits' : 'mergedPrs', n, locale)}`,
    countValue: formatInt(n, locale),
    countLabel: countLabel(countCommits ? 'commits' : 'mergedPrs', n, locale),
    proofUrl: row.proofUrl,
    years: first && last ? (first === last ? String(first) : `${first}–${last}`) : '',
    highlights: [...row.highlights]
      .sort((a, b) => b.mergedAt.localeCompare(a.mergedAt))
      .map((h) => ({ title: h.title, url: h.url, date: isoDate(h.mergedAt, locale) })),
  };
}

function careerView(locale: Locale, now: Date): CareerView[] {
  return career.map((role) => {
    const startYear = Number(role.from.slice(0, 4));
    const endYear = role.to ? Number(role.to.slice(0, 4)) : now.getUTCFullYear();
    return {
      org: role.org,
      via: role.via ?? null,
      title: role.title[locale],
      note: role.note ? role.note[locale] : null,
      from: monthYear(role.from, locale),
      to: role.to ? monthYear(role.to, locale) : locale === 'pt' ? 'hoje' : 'now',
      fromDatetime: role.from,
      toDatetime: role.to,
      current: role.to === null,
      startYear,
      endYear,
    };
  });
}

function compareData(snapshot: Snapshot, now: Date): CompareData {
  const maxYear = now.getUTCFullYear();
  const publicRepos = snapshot.repos.filter((r) => !r.fork || r.name === 'mysql-events');
  const byYear = stackByYear(publicRepos, careerStack, { minYear: person.since, maxYear });
  const years = Object.keys(byYear)
    .map(Number)
    .filter((y) => (byYear[y]?.length ?? 0) > 0)
    .sort((a, b) => a - b);
  const base = years.includes(compare.defaultBase) ? compare.defaultBase : (years[0] ?? maxYear);
  const head = years[years.length - 1] ?? maxYear;
  return {
    years,
    stackByYear: byYear,
    base,
    head,
    initial: diffStacks(byYear[base] ?? [], byYear[head] ?? []),
    repoYears: snapshot.repos.filter((r) => !r.fork).map((r) => new Date(r.createdAt).getUTCFullYear()),
  };
}

function heroNotes(snapshot: Snapshot, locale: Locale): HeroNoteView[] {
  const wr = snapshot.repos.find((r) => r.name === 'whats-reader');
  const agent = snapshot.upstream.find((u) => u.repo === 'NousResearch/hermes-agent');
  const webui = snapshot.upstream.find((u) => u.repo === 'nesquena/hermes-webui');
  const values = {
    tag: wr?.latestRelease?.tag,
    stars: wr ? formatInt(wr.stars, locale) : null,
    downloads: wr ? formatInt(wr.releaseDownloads, locale) : null,
    agentCommits: agent ? formatInt(agent.commits, locale) : null,
    webuiMerged: webui ? formatInt(webui.mergedPrs, locale) : null,
  };
  const notes: HeroNoteView[] = [];
  for (const note of hero.notes) {
    const text = fill(note.text[locale], values);
    if (text) notes.push({ role: note.role, label: roleLabel[note.role][locale], text });
  }
  return notes;
}

const pathFor = (locale: Locale) => (locale === 'en' ? '/' : `/${locale}/`);

export function buildView(snapshot: Snapshot, locale: Locale, build: BuildInfo): SiteView {
  const { now, sha } = build;
  const other: Locale = locale === 'en' ? 'pt' : 'en';
  const years = now.getUTCFullYear() - person.since;
  const packagesAll = snapshot.packages.filter((p) => !p.excluded);
  const age = snapshotAge(snapshot, now);
  const failing = Object.values(snapshot.sources).some((s) => !s.ok);
  const oldest = Object.values(snapshot.sources)
    .map((s) => s.lastSuccessAt)
    .filter((v): v is string => Boolean(v))
    .sort()[0];

  const sectionView = {} as SiteView['sections'];
  for (const key of sectionOrder) {
    const s = sections[key] as { label: L; claim: L; tag?: L; body?: L };
    const claim =
      fill(s.claim[locale], {
        count: formatInt(snapshot.totals.packages, locale),
        monthly: compact(snapshot.totals.monthlyDownloads, locale),
        years,
      }) ?? s.claim[locale];
    sectionView[key] = {
      label: s.label[locale],
      claim,
      ...(s.tag ? { tag: s.tag[locale] } : {}),
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
    nav: sectionOrder.map((key) => ({ key, label: sections[key].label[locale], href: `#${key}` })),
    hero: {
      calver: calver(now),
      calverDatetime: now.toISOString().slice(0, 10),
      latestLabel: hero.latest[locale],
      title: hero.title[locale],
      notes: heroNotes(snapshot, locale),
      cta: { email: hero.cta.email[locale], copy: hero.cta.copy[locale], copied: hero.cta.copied[locale] },
    },
    sections: sectionView,
    roleLabel: Object.fromEntries(Object.entries(roleLabel).map(([k, v]) => [k, v[locale]])) as Record<Role, string>,
    field: fieldView,
    now: nowEntries.map((entry) => {
      const repo = entry.repo ? snapshot.repos.find((r) => r.name === entry.repo) : undefined;
      const up = entry.upstream ? snapshot.upstream.find((u) => u.repo === entry.upstream) : undefined;
      const proofs: ProofView[] = [];
      if (up) {
        proofs.push({ value: compact(up.stars, locale), label: countLabel('stars', up.stars, locale), href: up.url });
        proofs.push({ value: formatInt(up.commits, locale), label: countLabel('commits', up.commits, locale), href: up.proofUrl });
        proofs.push({
          value: formatInt(up.prsOpened, locale),
          label: countLabel('prsOpened', up.prsOpened, locale),
          href: `${up.url}/pulls?q=is%3Apr+author%3Arodrigogs`,
        });
      }
      const stars = repo ? starsProof(repo, locale) : null;
      if (stars) proofs.push(stars);
      for (const fact of entry.facts ?? []) proofs.push(factProof(fact, locale));
      return {
        id: entry.id,
        name: t(entry.name, locale),
        note: entry.note[locale],
        proofs,
        links: linkViews(entry.links, locale),
        isPrivate: !entry.repo && !entry.upstream,
      };
    }),
    work: work.map((entry) => workView(entry, snapshot, locale, now)),
    upstream: snapshot.upstream.map((row) => upstreamRow(row, locale)).filter((v): v is UpstreamView => v !== null),
    packages: packagesAll.map((p) => ({
      registry: p.registry,
      name: p.name,
      url: p.url,
      version: p.version,
      monthly: formatInt(p.monthlyDownloads, locale),
      monthlyRaw: p.monthlyDownloads,
    })),
    career: careerView(locale, now),
    compare: {
      label: compare.label[locale],
      hint: compare.hint[locale],
      base: compare.base[locale],
      head: compare.head[locale],
      added: compare.added[locale],
      addedOne: compare.addedOne[locale],
      removed: compare.removed[locale],
      removedOne: compare.removedOne[locale],
      kept: compare.kept[locale],
      keptOne: compare.keptOne[locale],
      work: compare.work[locale],
      workOne: compare.workOne[locale],
      data: compareData(snapshot, now),
    },
    toolchain: {
      ships: { label: toolchain.ships.label[locale], items: toolchain.ships.items },
      groups: toolchain.groups.map((g) => ({ label: g.label[locale], items: g.items.map((item) => t(item, locale)) })),
      skillsLabel: toolchain.skillsLabel[locale],
      skills: toolchain.skills.map((s) => ({ name: s.name[locale], text: s.text[locale], href: 'href' in s ? s.href : null })),
    },
    totals: {
      stars: formatInt(snapshot.totals.stars, locale),
      repos: formatInt(snapshot.totals.repos, locale),
      monthlyDownloads: formatInt(snapshot.totals.monthlyDownloads, locale),
      packages: formatInt(snapshot.totals.packages, locale),
      contributions: snapshot.user.contributionsLastYear === null ? null : formatInt(snapshot.user.contributionsLastYear, locale),
      followers: formatInt(snapshot.user.followers, locale),
    },
    konami: { label: konami.label[locale] },
    footer: {
      built:
        fill(shortSha ? footer.built[locale] : footer.builtNoSha[locale], { date: isoDate(now.toISOString(), locale), sha: shortSha }) ?? '',
      data: fill(footer.data[locale], { age: relativeDays(age.days, locale) }) ?? '',
      stale: failing && oldest ? fill(footer.stale[locale], { date: isoDate(oldest, locale) }) : null,
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
      knowsAbout: [...toolchain.ships.items],
      sameAs: [person.github, person.linkedin].filter(Boolean),
    },
  };
}
