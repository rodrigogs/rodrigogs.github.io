/**
 * The toast: a big unboxed pink stamp over the viewport for 1.6 s, like the
 * end of a mission screen, in our own words. Purely visual (aria-hidden,
 * pointer-events none); the same words go to a polite status region.
 */

const SHOW_MS = 1600;
let timer = 0;

export function stamp(): void {
  const toast = document.querySelector<HTMLElement>('[data-toast]');
  const status = document.querySelector<HTMLElement>('[data-toast-status]');
  if (!toast) return;
  window.clearTimeout(timer);
  toast.removeAttribute('data-show');
  // Restart the entrance even on a quick second copy.
  void toast.offsetWidth;
  toast.setAttribute('data-show', '');
  if (status) status.textContent = [...toast.children].map((el) => el.textContent?.trim()).join(' ');
  timer = window.setTimeout(() => {
    toast.removeAttribute('data-show');
    if (status) status.textContent = '';
  }, SHOW_MS);
}
