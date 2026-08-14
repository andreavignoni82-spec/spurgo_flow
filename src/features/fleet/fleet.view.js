import { fleetFormTemplate } from './fleet.form.js';
import { countVehicleStates } from './fleet.model.js';
const esc = value => String(value ?? '—').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
const row = vehicle => `<tr data-vehicle-id="${esc(vehicle.id)}"><td data-label="Targa"><strong>${esc(vehicle.plate)}</strong></td><td data-label="Nome">${esc(vehicle.name)}</td><td data-label="Tipo">${esc(vehicle.type)}</td><td data-label="Stato"><span class="sf-fleet__status" data-active="${vehicle.active !== false}">${vehicle.active !== false ? 'ATTIVO' : 'NON ATTIVO'}</span></td><td class="sf-fleet__actions"><button type="button" data-action="edit">APRI / MODIFICA</button><button type="button" data-action="toggle">${vehicle.active !== false ? 'DISATTIVA' : 'RIATTIVA'}</button></td></tr>`;
export function fleetView(state) {
  const counts = countVehicleStates(state.vehicles); const rows = state.visible.map(row).join('');
  const empty = state.query ? 'Nessun mezzo trovato' : 'Nessun mezzo presente';
  return `<div class="sf-fleet"><div class="sf-fleet__heading"><h1>MEZZI &amp; FLOTTA</h1><p>Gestione operativa dei mezzi</p></div>
    <div class="sf-fleet__toolbar"><button type="button" data-action="new">+ NUOVO MEZZO</button><label for="fleet-search">RICERCA</label><input id="fleet-search" type="search" data-fleet-search value="${esc(state.query || '')}" placeholder="Targa, nome, tipo, note"></div>
    <dl class="sf-fleet__stats"><div><dt>Totale mezzi</dt><dd>${counts.total}</dd></div><div><dt>Attivi</dt><dd>${counts.active}</dd></div><div><dt>Non attivi</dt><dd>${counts.inactive}</dd></div></dl>
    <p data-realtime-notice class="sf-fleet__notice" role="status"${state.remoteUpdate ? '' : ' hidden'}>Sono disponibili aggiornamenti dal server</p>
    ${state.realtimeError ? '<p class="sf-fleet__notice" role="status">Sincronizzazione realtime non disponibile</p>' : ''}
    ${state.loading ? '<p role="status">Caricamento mezzi…</p>' : state.loadError ? '<p role="alert">Mezzi &amp; Flotta temporaneamente non disponibili</p>' : rows ? `<div class="sf-fleet__table-wrap"><table><thead><tr><th>Targa</th><th>Nome</th><th>Tipo</th><th>Stato</th><th>Azioni</th></tr></thead><tbody>${rows}</tbody></table></div>` : `<div class="sf-fleet__empty"><p>${empty}</p>${state.query ? '' : '<button type="button" data-action="new">+ AGGIUNGI IL PRIMO MEZZO</button>'}</div>`}
    ${state.form ? `<div class="sf-fleet__dialog">${fleetFormTemplate(state.form, { saving: state.saving, error: state.saveError })}</div>` : ''}</div>`;
}
