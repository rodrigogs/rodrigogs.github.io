/**
 * Konami code (up up down down left right left right B A): toggles the
 * retired vaporwave palette through data-theme on <html>. Esc restores.
 * One keydown listener, no work on any other event.
 */

const CODE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
const root = document.documentElement;
const plate = document.querySelector<HTMLElement>('[data-konami]');
const live = document.querySelector<HTMLElement>("[data-konami-status]");
let at = 0;

function set(on: boolean): void {
  if (on) root.dataset.theme = 'vaporwave';
  else delete root.dataset.theme;
  if (plate) plate.hidden = !on;
  if (live) live.textContent = on ? (plate?.textContent?.replace(/\s*·\s*/, ' ').replace(/\s+/g, ' ').trim() ?? '') : '';
}

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && root.dataset.theme === 'vaporwave') {
    set(false);
    at = 0;
    return;
  }
  const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
  at = key === CODE[at] ? at + 1 : key === CODE[0] ? 1 : 0;
  if (at === CODE.length) {
    at = 0;
    set(root.dataset.theme !== 'vaporwave');
  }
});
export {};
