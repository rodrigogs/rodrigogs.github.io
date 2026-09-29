/**
 * The cheat code: typing VAPORWAVE anywhere outside a form field toggles the
 * owner's original vaporwave look (the grid over the ocean and the old
 * neon four, from `vaporwave` in tokens.ts). A small line confirms it, and
 * the same words go to a polite status region. Typing it again restores.
 */

const CODE = 'VAPORWAVE';
const SHOW_MS = 2400;

const root = document.documentElement;
const line = document.querySelector<HTMLElement>('[data-cheat-line]');
const status = document.querySelector<HTMLElement>('[data-cheat-status]');
let typed = '';
let timer = 0;

function typing(target: EventTarget | null): boolean {
  return target instanceof HTMLElement && (target.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName));
}

addEventListener('keydown', (event) => {
  if (event.ctrlKey || event.metaKey || event.altKey || typing(event.target)) return;
  if (!/^[a-z]$/i.test(event.key)) return;
  typed = (typed + event.key.toUpperCase()).slice(-CODE.length);
  if (typed !== CODE) return;
  typed = '';
  const on = !root.hasAttribute('data-cheat');
  root.toggleAttribute('data-cheat', on);
  dispatchEvent(new CustomEvent('rg:cheat', { detail: on }));
  const text = (on ? line?.dataset.on : line?.dataset.off) ?? '';
  if (status) status.textContent = text;
  if (!line) return;
  line.textContent = text;
  line.hidden = false;
  window.clearTimeout(timer);
  timer = window.setTimeout(() => {
    line.hidden = true;
    if (status) status.textContent = '';
  }, SHOW_MS);
});
export {};
