export function createPlaceholderFeature(id, title) {
  let element;
  return {
    id,
    mount(container, { signal }) {
      element = document.createElement('section');
      element.className = 'app-shell';
      element.dataset.feature = id;
      element.innerHTML = `<div class="app-shell__card"><p class="app-shell__eyebrow">SPURGO FLOW 8 · CLEAN ARCHITECTURE</p><h1>${title}</h1><p>Fondazione architetturale v8.0.0-alpha.1</p></div>`;
      container.replaceChildren(element);
      signal.addEventListener('abort', () => element?.remove(), { once: true });
    },
    unmount() { element?.remove(); element = undefined; },
  };
}
