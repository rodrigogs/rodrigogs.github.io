/**
 * Copy-to-clipboard for every `[data-copy]` button: writes the value, flips
 * the button to "Copied" for two seconds and stamps the toast, which also
 * announces the copy in its polite status region (see Toast.astro).
 */

import { stamp } from './toast.ts';

const RESET_MS = 2000;

async function write(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Older browsers, or a denied permission: fall back to a selection copy.
    const field = document.createElement('textarea');
    field.value = text;
    field.setAttribute('readonly', '');
    field.style.position = 'fixed';
    field.style.opacity = '0';
    document.body.append(field);
    field.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    field.remove();
    return ok;
  }
}

for (const button of document.querySelectorAll<HTMLButtonElement>('[data-copy]')) {
  let timer = 0;
  button.addEventListener('click', async () => {
    if (!(await write(button.dataset.copy ?? ''))) return;
    window.clearTimeout(timer);
    button.dataset.state = 'copied';
    stamp();
    timer = window.setTimeout(() => delete button.dataset.state, RESET_MS);
  });
}
