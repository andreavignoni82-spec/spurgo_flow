const esc = value => String(value ?? '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const field = (name, label, value = '', type = 'text', disabled = false) => `<label>${label}<input name="${name}" type="${type}" value="${esc(value)}" ${disabled ? 'disabled' : ''}></label>`;

export function renderOperators({ operators, teams, form, saving, error, errors = {} }) {
  const editing = Boolean(form?.id);
  return `<section class="sf-people-operators"><h2>Operatori</h2>
  <form data-role="operator-form"><h3>${editing ? 'Modifica anagrafica' : 'Nuovo operatore'}</h3><div class="sf-people-form">
  ${field('nome', 'Nome', form?.nome)}${field('cognome', 'Cognome', form?.cognome)}
  ${field('username', 'Username', form?.username, 'text', editing)}${editing ? '' : field('password', 'Password', '', 'password')}
  ${field('telefono', 'Telefono', form?.telefono)}${field('mezzo', 'Mezzo', form?.mezzo)}${field('ruolo', 'Ruolo / note', form?.ruolo)}
  ${editing ? '' : `<label>Squadra iniziale<select name="teamId"><option value="">Nessuna</option>${teams.map(team => `<option value="${esc(team.id)}">${esc(team.name)}</option>`).join('')}</select></label>`}
  </div>${Object.values(errors).map(esc).join(' · ')}${error ? `<p class="sf-people-error">${esc(error)}</p>` : ''}<div class="sf-people-actions"><button ${saving ? 'disabled' : ''}>${saving ? 'Salvataggio…' : 'Salva operatore'}</button>${editing ? '<button type="button" data-action="cancel-operator">Annulla</button>' : ''}</div></form>
  <div class="sf-people-list">${operators.map(operator => `<article data-operator-id="${esc(operator.id)}"><div><strong>${esc(`${operator.nome} ${operator.cognome}`.trim())}</strong><small>@${esc(operator.username)} · ${esc(operator.ruolo)} · ${esc(operator.mezzo || 'Nessun mezzo')}</small><small>${esc(operator.telefono)}</small></div><span>${operator.active ? 'ATTIVO' : 'DISATTIVATO'}</span><div class="sf-people-actions"><button data-action="edit-operator">Modifica</button><button data-action="toggle-operator">${operator.active ? 'Disattiva' : 'Riattiva'}</button></div></article>`).join('') || '<p>Nessun operatore.</p>'}</div></section>`;
}
