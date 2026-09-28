/**
 * Scroll spy: the nav noun of the section crossing the middle of the
 * viewport gets aria-current="true" (styled as the active state).
 */

const links = new Map<string, HTMLAnchorElement>();
for (const a of document.querySelectorAll<HTMLAnchorElement>('a[data-spy]')) {
  if (a.dataset.spy) links.set(a.dataset.spy, a);
}

const sections = [...links.keys()]
  .map((key) => document.getElementById(key))
  .filter((el): el is HTMLElement => el !== null);

function mark(key: string | null): void {
  for (const [k, a] of links) {
    if (k === key) a.setAttribute('aria-current', 'true');
    else a.removeAttribute('aria-current');
  }
}

if (sections.length > 0 && 'IntersectionObserver' in window) {
  const visible = new Set<string>();
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) visible.add(entry.target.id);
        else visible.delete(entry.target.id);
      }
      // First section in page order that crosses the middle line.
      const current = sections.find((s) => visible.has(s.id));
      mark(current ? current.id : null);
    },
    { rootMargin: '-50% 0px -50% 0px', threshold: 0 },
  );
  for (const section of sections) observer.observe(section);
}
