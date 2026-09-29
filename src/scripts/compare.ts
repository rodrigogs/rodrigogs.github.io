/**
 * Compare, the radio tuner: diff the stack between the years on two dials
 * (a <select> each, with ◄ ► step buttons either side).
 *
 * The server renders the default range with the dials disabled, so this
 * module enables them and takes over from an already-visible state. It
 * reads the range from ?compare=BASE...HEAD on load, keeps the URL in sync
 * with history.replaceState, announces each new diff through a polite live
 * region, and animates the lines: lines on their way out are struck through
 * and fade, then new lines are revealed left to right with the exponential
 * ease-out token. Past the fold limit, lines wait behind a disclosure button
 * (aria-expanded) that stays open across range changes once opened.
 */

import { motion } from '../design/tokens.ts';
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
  const ds = form.dataset;
  /** Singular form when the count is exactly 1, plural otherwise. */
  const words = {
    added: (n: number) => (n === 1 ? ds.addedOne : ds.added) ?? '',
    removed: (n: number) => (n === 1 ? ds.removedOne : ds.removed) ?? '',
    kept: (n: number) => (n === 1 ? ds.keptOne : ds.kept) ?? '',
    work: (n: number) => ((n === 1 ? ds.workOne : ds.work) ?? '').replace('{repos}', num(n)),
  };
  const limit = Number(ds.limit) || Infinity;

  const out = <T extends HTMLElement = HTMLElement>(key: string) => form.querySelector<T>(`[data-out="${key}"]`);
  const list = out<HTMLUListElement>('lines');
  const more = out<HTMLButtonElement>('more');
  const announce = out('announce');
  const template = document.querySelector<HTMLTemplateElement>('template[data-line-template]');
  if (!list || !template) return;

  // The motion tokens come from the source module, not from computed style, so init never forces layout.
  const { ease, fast, base, slow } = motion;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  let state = { base: data.base, head: data.head };
  let generation = 0;

  type Dial = 'base' | 'head';
  const dial = (name: Dial) => form.querySelector<HTMLSelectElement>(`select[name="${name}"]`);
  const steps = [...form.querySelectorAll<HTMLButtonElement>('button[data-step]')];

  function checked(name: Dial, fallback: number): number {
    const select = dial(name);
    return select ? Number(select.value) : fallback;
  }

  function check(name: Dial, year: number): void {
    const select = dial(name);
    if (select) select.value = String(year);
  }

  /** The step buttons stop at the first and last year. */
  function syncSteps(): void {
    for (const button of steps) {
      const select = dial(button.dataset.step as Dial);
      if (!select) continue;
      const next = select.selectedIndex + Number(button.dataset.dir);
      button.disabled = next < 0 || next >= select.options.length;
    }
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
    const [a, r, k] = [diff.added.length, diff.removed.length, diff.kept.length];
    return `${b}...${h}: ${num(a)} ${words.added(a)}, ${num(r)} ${words.removed(r)}, ${num(k)} ${words.kept(k)}. ${words.work(repos)}.`;
  }

  /** Marks the lines past the limit and sets the disclosure for them. */
  function fold(nodes: HTMLLIElement[]): void {
    const folds = nodes.length > limit + 1;
    let tailAdded = 0;
    let tailRemoved = 0;
    nodes.forEach((li, i) => {
      const inTail = folds && i >= limit;
      li.toggleAttribute('data-tail', inTail);
      if (!inTail) return;
      if (li.dataset.kind === 'add') tailAdded++;
      else tailRemoved++;
    });
    if (!more) return;
    more.hidden = !folds;
    if (!folds) return;
    const set = (key: string, n: number, sign: string) => {
      const el = out(key);
      if (!el) return;
      el.hidden = n === 0;
      el.textContent = `${sign}${num(n)}`;
    };
    set('more-added', tailAdded, '+');
    set('more-removed', tailRemoved, '−');
  }

  function setExpanded(open: boolean): void {
    more?.setAttribute('aria-expanded', String(open));
    list!.toggleAttribute('data-collapsed', !open);
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
    set('added', `+${num(diff.added.length)}`);
    set('added-word', words.added(diff.added.length));
    set('removed', `−${num(diff.removed.length)}`);
    set('removed-word', words.removed(diff.removed.length));
    set('kept', num(diff.kept.length));
    set('kept-word', words.kept(diff.kept.length));
    set('work', words.work(repos));
    const kinds = blocks(diff.added.length, diff.removed.length);
    out('blocks')
      ?.querySelectorAll('i')
      .forEach((el, i) => {
        el.dataset.kind = kinds[i] ?? 'none';
      });

    syncSteps();
    updateLines(diff, animate && !reducedMotion.matches);
    if (animate && announce) announce.textContent = summary(b, h, diff, repos);
  }

  function updateLines(diff: ReturnType<typeof diffStacks>, animate: boolean): void {
    const gen = ++generation;
    // Settle anything still leaving from a previous change.
    for (const el of list!.querySelectorAll('.leaving')) el.remove();

    // Removals first, as in a unified diff (and as the server renders them).
    const wanted: [Kind, string][] = [
      ...diff.removed.map((n): [Kind, string] => ['rem', n]),
      ...diff.added.map((n): [Kind, string] => ['add', n]),
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
      fold(nodes);
      if (!animate) return;
      fresh.forEach((li, i) => {
        if (li.hasAttribute('data-tail') && list!.hasAttribute('data-collapsed')) return;
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

  more?.addEventListener('click', () => setExpanded(more.getAttribute('aria-expanded') !== 'true'));

  // Tune: the step buttons move one year and fire the same change as the select.
  form.addEventListener('click', (event) => {
    const button = (event.target as Element).closest<HTMLButtonElement>('button[data-step]');
    const select = button && dial(button.dataset.step as Dial);
    if (!button || !select) return;
    const next = select.selectedIndex + Number(button.dataset.dir);
    if (next < 0 || next >= select.options.length) return;
    select.selectedIndex = next;
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });

  for (const el of form.querySelectorAll<HTMLSelectElement | HTMLButtonElement>('select, button[data-step]')) el.disabled = false;
  syncSteps();

  form.addEventListener('change', () => {
    state = { base: checked('base', state.base), head: checked('head', state.head) };
    render(true);
    writeUrl();
  });
  form.addEventListener('submit', (event) => event.preventDefault());
}
