import { validateClientForm } from './clients.validators.js';

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function clientFormTemplate(client = {}, { saving = false, error = '' } = {}) {
  const field = (name, label, type = 'text') => `<label>${label}<input name="${name}" type="${type}" value="${escape(client[name])}"${saving ? ' disabled' : ''}></label>`;
  return `<form class="sf-clients__form" data-client-form novalidate>
    <h2>${client.id ? 'Modifica cliente' : 'Nuovo cliente'}</h2>
    ${error ? `<p class="sf-clients__error" role="alert">${escape(error)}</p>` : ''}
    ${field('name', 'Nome / Ragione sociale')} ${field('fiscalName', 'Ragione fiscale')} ${field('phone', 'Telefono', 'tel')} ${field('email', 'Email', 'email')} ${field('address', 'Indirizzo')} ${field('city', 'Città')}
    <label>Note<textarea name="notes"${saving ? ' disabled' : ''}>${escape(client.notes)}</textarea></label>
    <label class="sf-clients__check"><input name="active" type="checkbox"${client.active !== false ? ' checked' : ''}${saving ? ' disabled' : ''}> Attivo</label>
    <div class="sf-clients__actions"><button type="button" data-action="cancel"${saving ? ' disabled' : ''}>ANNULLA</button><button type="submit"${saving ? ' disabled' : ''}>${saving ? 'Salvataggio…' : 'SALVA'}</button></div>
  </form>`;
}
export function readClientForm(form) {
  const data = new FormData(form); const value = {};
  for (const key of ['name','fiscalName','phone','email','address','city','notes']) value[key] = String(data.get(key) ?? '').trim();
  value.active = data.has('active'); return value;
}
export { validateClientForm };
