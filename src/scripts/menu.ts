/**
 * The compact pause menu (under 70rem, as in SiteHeader.astro): the MENU button opens the section
 * nouns as an overlay panel under the header frame. While open, Tab stays
 * between the button and the nouns, Esc or a tap outside closes and hands
 * focus back to the button, and picking a noun closes it. At wider screens
 * the nouns are an inline row and this module stands by. Focus moves never
 * scroll: the header is sticky, and the page's scroll-padding would
 * otherwise pull the page up to "reveal" it.
 */

const header = document.querySelector<HTMLElement>('[data-menu]');
const toggle = header?.querySelector<HTMLButtonElement>('[data-menu-toggle]');
const nav = toggle ? document.getElementById(toggle.getAttribute('aria-controls') ?? '') : null;

if (header && toggle && nav) {
  const compact = matchMedia('(max-width: 69.99rem)');
  const links = [...nav.querySelectorAll<HTMLAnchorElement>('a[href]')];

  const isOpen = () => header.hasAttribute('data-open');

  function set(open: boolean, restoreFocus = false): void {
    header!.toggleAttribute('data-open', open);
    toggle!.setAttribute('aria-expanded', String(open));
    if (open) (links.find((a) => a.getAttribute('aria-current') === 'true') ?? links[0])?.focus({ preventScroll: true });
    else if (restoreFocus) toggle!.focus({ preventScroll: true });
  }

  toggle.addEventListener('click', () => set(!isOpen()));

  document.addEventListener('keydown', (event) => {
    if (!isOpen()) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      set(false, true);
      return;
    }
    if (event.key !== 'Tab') return;
    const ring = [toggle, ...links];
    const at = ring.indexOf(document.activeElement as HTMLAnchorElement);
    const next = event.shiftKey ? (at <= 0 ? ring.length - 1 : at - 1) : at === ring.length - 1 ? 0 : at + 1;
    event.preventDefault();
    ring[next]?.focus({ preventScroll: true });
  });

  // A noun jumps to its section and closes the menu; a tap on the dimmed page closes it.
  nav.addEventListener('click', (event) => {
    if ((event.target as Element).closest('a')) set(false);
  });
  header.addEventListener('click', (event) => {
    if (event.target === header && isOpen()) set(false, true);
  });

  compact.addEventListener('change', () => isOpen() && set(false));
  header.dataset.ready = '';
}

export {};
