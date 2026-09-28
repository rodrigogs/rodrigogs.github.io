/**
 * Copy-to-clipboard for every `[data-copy]` button: writes the value, flips
 * the button to its "Copied" state for two seconds and announces it in the
 * polite status region that follows the button.
 */

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
  const next = button.nextElementSibling;
  const status = next instanceof HTMLElement && next.hasAttribute('data-copy-status') ? next : null;
  let timer = 0;

  button.addEventListener('click', async () => {
    const value = button.dataset.copy ?? '';
    if (!(await write(value))) return;
    window.clearTimeout(timer);
    button.dataset.state = 'copied';
    if (status) status.textContent = `${button.dataset.copied ?? ''}: ${value}`;
    timer = window.setTimeout(() => {
      delete button.dataset.state;
      if (status) status.textContent = '';
    }, RESET_MS);
  });
}
