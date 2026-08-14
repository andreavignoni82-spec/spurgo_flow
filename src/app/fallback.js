import { BUILD_LABEL, VERSION } from './version.js';

export function renderBootFallback(container, message = 'Errore di avvio') {
  if (!container) return;
  const fallback = document.createElement('main');
  fallback.className = 'boot-fallback';
  fallback.setAttribute('role', 'alert');
  fallback.innerHTML = `<strong>SPURGO FLOW 8</strong><h1>${message}</h1><p>${VERSION}</p><small>${BUILD_LABEL}</small>`;
  container.replaceChildren(fallback);
}
