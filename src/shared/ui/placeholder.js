import { BUILD_LABEL, VERSION } from '../../app/version.js';
import { shell } from './operational.js';

export const routes = [['dashboard', 'Dashboard'], ['clients', 'Clienti'], ['fleet', 'Mezzi'], ['people', 'Operatori'], ['interventions', 'Interventi'], ['agenda', 'Agenda'], ['control-room', 'Control Room'], ['messages', 'Messaggi'], ['reports', 'Rapportini'], ['statistics', 'Statistiche'], ['operator', 'App Operatore']];

const titles=Object.freeze({dashboard:'Dashboard',clients:'Clienti',fleet:'Mezzi',people:'Operatori',interventions:'Interventi',agenda:'Agenda','control-room':'Control Room',messages:'Messaggi',reports:'Rapportini',statistics:'Statistiche',operator:'Area Operatore'});

export function shellTemplate(id, content) {
  return shell(titles[id]??'Spurgo Flow',content,id);
}

export function createPlaceholderFeature(id, title) {
  let element;
  return {
    id,
    mount(container, { signal }) {
      element = document.createElement('section');
      element.className = 'app-shell';
      element.dataset.feature = id;
      element.innerHTML = shellTemplate(id, `<section class="ops-card"><h2>${title}</h2><p>Modulo Spurgo Flow disponibile.</p><p><span class="badge">${VERSION}</span></p><small>${BUILD_LABEL}</small></section>`);
      container.replaceChildren(element);
      signal.addEventListener('abort', () => element?.remove(), { once: true });
    },
    unmount() { element?.remove(); element = undefined; },
  };
}
