/**
 * Compare: diff the stack between any two years picked on the version rail.
 *
 * The server renders the default range, so this module only takes over
 * from an already-visible state. It reads the range from ?compare=BASE...HEAD
 * on load, keeps the URL in sync with history.replaceState, announces each
 * new diff through a polite live region, and plays the page's one authored
 * motion: lines on their way out are struck through and fade, then new lines
 * are revealed left to right with the exponential ease-out token.
 */

import { diffStacks } from '../lib/derive.ts';

interface CompareData {
  years: number[];
  stackByYear: Record<string, string[]>;
  repoYears: number[];
  base: number;
  head: number;
}

type Kind = 'add' | 'rem';

const form = document.querySelector<HTMLFormElement>('form[data-compare]');
if (form) init(form);

function init(form: HTMLFormElement): void {
  const raw = form.querySelector('script[data-compare-data]')?.textContent;
  if (!raw) return;
  const data = JSON.parse(raw) as CompareData;
  const nf = new Intl.NumberFormat(form.dataset.lang);
  const num = (n: number) => nf.format(n);
  const words = {
    added: form.dataset.added ?? '',
    removed: form.dataset.removed ?? '',
    kept: form.dataset.kept ?? '',
    work: form.dataset.work ?? '',
  };

  const out = <T extends HTMLElement = HTMLElement>(key: string) => form.querySelector<T>(`[data-out="${key}"]`);
  const list = out<HTMLUListElement>('lines');
  const announce = out('announce');
  const range = form.querySelector<HTMLElement>('[data-range]');
  const rail = form.querySelector<HTMLElement>('[data-rail]');
  const template = document.querySelector<HTMLTemplateElement>('template[data-line-template]');
  if (!list || !rail || !template) return;

  const to = Number(rail.dataset.to);
  const rowOf = (year: number) => to - year + 2;

  const rootStyle = getComputedStyle(document.documentElement);
  const ms = (name: string, fallback: number) => Number.parseFloat(rootStyle.getPropertyValue(name)) || fallback;
  const ease = rootStyle.getPropertyValue('--ease').trim() || 'ease-out';
  const fast = ms('--d-fast', 160);
  const base = ms('--d-base', 320);
  const slow = ms('--d-slow', 560);
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let state = { base: data.base, head: data.head };
  let generation = 0;

  const radios = (name: 'base' | 'head') => [...form.querySelectorAll<HTMLInputElement>(`input[name="${name}"]`)];

  function checked(name: 'base' | 'head', fallback: number): number {
    const input = radios(name).find((r) => r.checked);
    return input ? Number(input.value) : fallback;
  }

  function check(name: 'base' | 'head', year: number): void {
    for (const r of radios(name)) r.checked = Number(r.value) === year;
  }

  function blocks(a: number, r: number): string[] {
    const total = a + r;
    if (total === 0) return Array(5).fill('none');
    let adds = Math.round((5 * a) / total);
    if (a > 0 && adds === 0) adds = 1;
    if (r > 0 && adds === 5) adds = 4;
    return Array.from({ length: 5 }, (_, i) => (i < adds ? 'add' : 'rem'));
  }

  function makeLine(kind: Kind, name: string): HTMLLIElement {
    const li = template!.content.firstElementChild!.cloneNode(true) as HTMLLIElement;
    li.dataset.kind = kind;
    li.dataset.key = `${kind}:${name}`;
    li.querySelector('span')!.textContent = name;
    return li;
  }

  function summary(b: number, h: number, diff: ReturnType<typeof diffStacks>, repos: number): string {
    return `${b}...${h}: ${num(diff.added.length)} ${words.added}, ${num(diff.removed.length)} ${words.removed}, ${num(diff.kept.length)} ${words.kept}. ${words.work.replace('{repos}', num(repos))}.`;
  }

  function render(animate: boolean): void {
    const { base: b, head: h } = state;
    const diff = diffStacks(data.stackByYear[b] ?? [], data.stackByYear[h] ?? []);
    const lo = Math.min(b, h);
    const hi = Math.max(b, h);
    const repos = data.repoYears.filter((y) => y >= lo && y <= hi).length;

    const set = (key: string, text: string) => {
      const el = out(key);
      if (el) el.textContent = text;
    };
    set('base', String(b));
    set('head', String(h));
    set('added', `+${num(diff.added.length)}`);
    set('removed', `−${num(diff.removed.length)}`);
    set('kept', num(diff.kept.length));
    set('work', words.work.replace('{repos}', num(repos)));
    const kinds = blocks(diff.added.length, diff.removed.length);
    out('blocks')
      ?.querySelectorAll('i')
      .forEach((el, i) => {
        el.dataset.kind = kinds[i] ?? 'none';
      });

    if (range) range.style.gridRow = `${rowOf(hi)} / ${rowOf(lo) + 1}`;
    for (const el of rail!.querySelectorAll<HTMLElement>('[data-year]')) {
      const y = Number(el.dataset.year);
      if (y === b) el.dataset.edge = 'base';
      else if (y === h) el.dataset.edge = 'head';
      else delete el.dataset.edge;
    }

    updateLines(diff, animate && !reducedMotion.matches);
    if (animate && announce) announce.textContent = summary(b, h, diff, repos);
  }

  function updateLines(diff: ReturnType<typeof diffStacks>, animate: boolean): void {
    const gen = ++generation;
    // Settle anything still leaving from a previous change.
    for (const el of list!.querySelectorAll('.leaving')) el.remove();

    const wanted: [Kind, string][] = [
      ...diff.added.map((n): [Kind, string] => ['add', n]),
      ...diff.removed.map((n): [Kind, string] => ['rem', n]),
    ];
    const wantedKeys = new Set(wanted.map(([k, n]) => `${k}:${n}`));
    const current = new Map<string, HTMLLIElement>();
    for (const li of list!.querySelectorAll<HTMLLIElement>('li[data-key]')) current.set(li.dataset.key!, li);

    const enter = () => {
      if (gen !== generation) return;
      const fresh: HTMLLIElement[] = [];
      const nodes = wanted.map(([kind, name]) => {
        const existing = current.get(`${kind}:${name}`);
        if (existing) return existing;
        const li = makeLine(kind, name);
        fresh.push(li);
        return li;
      });
      list!.replaceChildren(...nodes);
      if (!animate) return;
      fresh.forEach((li, i) => {
        li.animate(
          [
            { clipPath: 'inset(0 100% 0 0)', opacity: 0.35 },
            { clipPath: 'inset(0 0% 0 0)', opacity: 1 },
          ],
          { duration: slow, easing: ease, delay: Math.min(i, 12) * 18, fill: 'backwards' },
        );
      });
    };

    const leaving = [...current].filter(([key]) => !wantedKeys.has(key)).map(([, li]) => li);
    if (!animate || leaving.length === 0) {
      enter();
      return;
    }

    for (const li of leaving) li.classList.add('leaving');
    const fades = leaving.map(
      (li) => li.animate([{ opacity: 1 }, { opacity: 0 }], { duration: base, delay: fast, easing: ease, fill: 'forwards' }).finished,
    );
    Promise.allSettled(fades).then(enter);
  }

  function writeUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.set('compare', `${state.base}...${state.head}`);
    window.history.replaceState(window.history.state, '', url);
  }

  // Deep link: ?compare=2014...2026 (two dots accepted too).
  const param = new URL(window.location.href).searchParams.get('compare');
  const match = param?.match(/^(\d{4})\.{2,3}(\d{4})$/);
  if (match) {
    const b = Number(match[1]);
    const h = Number(match[2]);
    if (data.years.includes(b) && data.years.includes(h) && (b !== state.base || h !== state.head)) {
      state = { base: b, head: h };
      check('base', b);
      check('head', h);
      render(false);
    }
  }

  form.addEventListener('change', () => {
    state = { base: checked('base', state.base), head: checked('head', state.head) };
    render(true);
    writeUrl();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
}
