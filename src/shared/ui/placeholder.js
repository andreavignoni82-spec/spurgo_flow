import { BUILD_LABEL, PRODUCT_LABEL, VERSION } from '../../app/version.js';
import { environment } from '../../config/environment.js';

const routes = [['dashboard', 'Dashboard'], ['clients', 'Clienti'], ['fleet', 'Flotta'], ['people', 'Operatori'], ['interventions', 'Interventi'], ['agenda', 'Agenda'], ['control-room', 'Control Room'], ['messages', 'Messaggi'], ['reports', 'Rapportini'], ['statistics', 'Statistiche'], ['operator', 'App Operatore']];

export function createPlaceholderFeature(id, title) {
  let element;
  return {
    id,
    mount(container, { signal }) {
      element = document.createElement('section');
      element.className = 'app-shell';
      element.dataset.feature = id;
      const navigation = routes.map(([route, label]) => `<button type="button" data-route="${route}"${route === id ? ' aria-current="page"' : ''}>${label}</button>`).join('');
      const driver = environment.driver === 'firebase-emulator' ? 'FIREBASE EMULATOR' : 'MEMORY';
      element.innerHTML = `<header><strong>SPURGO FLOW 8</strong><p class="app-shell__eyebrow">${PRODUCT_LABEL}</p><p>Data driver: <strong>${driver}</strong></p></header><nav aria-label="Funzionalità">${navigation}</nav><div class="app-shell__card"><h1>${title}</h1><p>Foundation v8 avviata correttamente</p><p>${VERSION}</p><small>${BUILD_LABEL}</small></div>`;
      container.replaceChildren(element);
      signal.addEventListener('abort', () => element?.remove(), { once: true });
    },
    unmount() { element?.remove(); element = undefined; },
  };
}
