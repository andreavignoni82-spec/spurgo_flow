const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[char]);

export function renderClients(container, model) {
  const cards = model.clients.length ? model.clients.map(client => `<article class="sf-clients__card" data-client-id="${escapeHtml(client.id)}">
    <h3>${escapeHtml(client.name)}</h3><p>${escapeHtml(client.address)}${client.city ? ` · ${escapeHtml(client.city)}` : ''}</p>
    <p class="sf-clients__meta">${escapeHtml(client.phone)}${client.email ? ` · ${escapeHtml(client.email)}` : ''}<br>Referente: ${escapeHtml(client.contact || '—')}<br>${escapeHtml(client.notes)}</p>
    <div class="sf-clients__actions"><button type="button" data-action="edit">Modifica</button><button type="button" data-action="intervention">Nuovo intervento</button><button type="button" class="sf-clients__danger" data-action="delete">Elimina</button></div>
  </article>`).join('') : '<p class="sf-clients__empty">Nessun cliente.</p>';
  container.innerHTML = `<div class="sf-clients"><header class="sf-clients__header"><div><h1>Clienti &amp; Impianti</h1><p>Anagrafica clienti, contatti e storico impianti</p></div><button type="button" data-action="new">+ Nuovo cliente</button></header>
    ${model.error && !model.form ? `<p class="sf-clients__page-error" role="alert">${escapeHtml(model.error)}</p>` : ''}
    <div class="sf-clients__panel"><input class="sf-clients__search" data-role="search" aria-label="Cerca clienti" placeholder="Cerca cliente, comune, telefono..." value="${escapeHtml(model.query)}"><div class="sf-clients__grid">${cards}</div></div>
    <div class="sf-clients__modal${model.form ? ' is-open' : ''}" data-role="modal" aria-hidden="${!model.form}">${model.form ? formHtml(model) : ''}</div></div>`;
}

function formHtml(model) {
  const c = model.form;
  const field = (name, label, full = false) => `<label class="${full ? 'sf-clients__full' : ''}">${label}<input name="${name}" value="${escapeHtml(c[name])}"></label>`;
  return `<div class="sf-clients__dialog" role="dialog" aria-modal="true"><h2>${c.id ? 'Modifica cliente' : 'Nuovo cliente'}</h2><form data-role="form"><div class="sf-clients__form-error" role="alert">${escapeHtml(model.error || model.errors?.name || '')}</div><div class="sf-clients__form-grid">
    ${field('name', 'Ragione sociale / nome', true)}${field('address', 'Via / civico')}${field('city', 'Comune')}${field('phone', 'Telefono')}${field('email', 'E-mail')}${field('contact', 'Referente', true)}<label class="sf-clients__full">Impianti / note<textarea name="notes">${escapeHtml(c.notes)}</textarea></label></div>
    <div class="sf-clients__actions"><button type="button" data-action="cancel">Annulla</button><button type="submit" ${model.saving ? 'disabled' : ''}>${model.saving ? 'Salvataggio…' : 'Salva cliente'}</button></div></form></div>`;
}

export function readClientForm(form) { return Object.fromEntries(new FormData(form).entries()); }
