const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

export function renderFleet(container, model) {
  const cards = model.vehicles.length ? model.vehicles.map(vehicle => `<article class="sf-fleet__card" data-vehicle-id="${escapeHtml(vehicle.id)}">
    <h3>${escapeHtml(vehicle.name)}</h3><p class="sf-fleet__meta">${escapeHtml(vehicle.code)} · ${escapeHtml(vehicle.type)} · ${escapeHtml(vehicle.plate)}</p>
    <p>Stato: <strong>${escapeHtml(vehicle.status)}</strong></p><p>Capacità: ${escapeHtml(vehicle.capacity || '—')} · Ore/km: ${escapeHtml(vehicle.hours)}</p>
    <p>Manutenzione: ${escapeHtml(vehicle.nextMaintenance || '—')}</p><div class="sf-fleet__actions"><button type="button" data-action="edit">Modifica</button><button type="button" class="sf-fleet__danger" data-action="delete">Elimina</button></div>
  </article>`).join('') : '<p class="sf-fleet__empty">Nessun mezzo.</p>';
  container.innerHTML = `<div class="sf-fleet"><header class="sf-fleet__header"><div><h1>Mezzi &amp; Flotta</h1><p>Anagrafica mezzi, stato e assegnazioni</p></div><button type="button" data-action="new">+ Nuovo mezzo</button></header>
    ${model.error && !model.form ? `<p class="sf-fleet__page-error" role="alert">${escapeHtml(model.error)}</p>` : ''}
    <div class="sf-fleet__panel"><input class="sf-fleet__search" data-role="search" aria-label="Cerca mezzi" placeholder="Cerca mezzo, targa, tipologia..." value="${escapeHtml(model.query)}"><div class="sf-fleet__grid">${cards}</div></div>
    <div class="sf-fleet__modal${model.form ? ' is-open' : ''}" aria-hidden="${!model.form}">${model.form ? formHtml(model) : ''}</div></div>`;
}

function formHtml(model) {
  const vehicle = model.form;
  const field = (name, label, type = 'text') => `<label>${label}<input name="${name}" type="${type}" value="${escapeHtml(vehicle[name])}"></label>`;
  const statuses = ['Operativa', 'Disponibile', 'In intervento', 'Manutenzione', 'Fuori servizio'];
  return `<div class="sf-fleet__dialog" role="dialog" aria-modal="true"><h2>${vehicle.id ? 'Modifica mezzo' : 'Nuovo mezzo'}</h2><form data-role="form"><p class="sf-fleet__form-error" role="alert">${escapeHtml(model.error || model.errors?.name || model.errors?.hours || '')}</p><div class="sf-fleet__form-grid">
    ${field('name', 'Nome mezzo')}${field('code', 'Codice')}${field('type', 'Tipologia')}${field('plate', 'Targa')}${field('capacity', 'Capacità')}<label>Stato<select name="status">${statuses.map(status => `<option${vehicle.status === status ? ' selected' : ''}>${status}</option>`).join('')}</select></label>${field('hours', 'Ore/km', 'number')}${field('nextMaintenance', 'Prossima manutenzione')}</div>
    <div class="sf-fleet__actions"><button type="button" data-action="cancel">Annulla</button><button type="submit" ${model.saving ? 'disabled' : ''}>${model.saving ? 'Salvataggio…' : 'Salva mezzo'}</button></div></form></div>`;
}

export function readVehicleForm(form) { return Object.fromEntries(new FormData(form).entries()); }
