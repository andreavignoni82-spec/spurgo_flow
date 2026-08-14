import { clientFormTemplate } from './clients.form.js';

const esc = value => String(value ?? '—').replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;');
export function clientsView(state) {
  const rows = state.visible.map(client => `<article class="sf-clients__card" data-client-id="${esc(client.id)}"><div><strong>${esc(client.name)}</strong>${client.fiscalName ? `<small>${esc(client.fiscalName)}</small>` : ''}</div><span>${esc(client.phone)}</span><span>${esc(client.city)}</span><span class="sf-clients__status" data-active="${client.active !== false}">${client.active !== false ? 'ATTIVO' : 'DISATTIVATO'}</span><div class="sf-clients__actions"><button type="button" data-action="edit">APRI / MODIFICA</button><button type="button" data-action="toggle">${client.active !== false ? 'DISATTIVA' : 'RIATTIVA'}</button></div></article>`).join('');
  return `<div class="sf-clients"><div class="sf-clients__heading"><h1>CLIENTI &amp; IMPIANTI</h1><p>Anagrafica clienti e sede principale</p></div>
    <div class="sf-clients__toolbar"><button type="button" data-action="new">+ NUOVO CLIENTE</button><label>RICERCA<input type="search" data-client-search value="${esc(state.query || '')}" placeholder="Nome, telefono, email, città"></label></div>
    ${state.realtimeError ? '<p class="sf-clients__notice" role="status">Sincronizzazione realtime non disponibile</p>' : ''}
    ${state.loading ? '<p role="status">Caricamento clienti…</p>' : state.loadError ? '<p role="alert">Clienti temporaneamente non disponibili</p>' : `<div class="sf-clients__list">${rows || '<p>Nessun cliente trovato.</p>'}</div>`}
    ${state.form ? `<div class="sf-clients__dialog">${clientFormTemplate(state.form, { saving: state.saving, error: state.saveError })}</div>` : ''}</div>`;
}
