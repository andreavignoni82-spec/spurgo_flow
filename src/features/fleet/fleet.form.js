import { normalizePlate } from './fleet.model.js';
import { validateVehicleForm } from './fleet.validators.js';

const escape = value => String(value ?? '').replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');
export function fleetFormTemplate(vehicle = {}, { saving = false, error = '' } = {}) {
  const disabled = saving ? ' disabled' : '';
  return `<form class="sf-fleet__form" data-fleet-form novalidate><h2>${vehicle.id ? 'Modifica mezzo' : 'Nuovo mezzo'}</h2>
    ${error ? `<p class="sf-fleet__error" role="alert">${escape(error)}</p>` : ''}
    <label for="vehicle-plate">Targa *</label><input id="vehicle-plate" name="plate" value="${escape(vehicle.plate)}" required autocomplete="off"${disabled}>
    <label for="vehicle-name">Nome mezzo</label><input id="vehicle-name" name="name" value="${escape(vehicle.name)}"${disabled}>
    <label for="vehicle-type">Tipo mezzo</label><input id="vehicle-type" name="type" list="vehicle-types" value="${escape(vehicle.type)}"${disabled}><datalist id="vehicle-types"><option value="Autospurgo"><option value="Autobotte"><option value="Furgone"><option value="Autocarro"><option value="Veicolo operativo"><option value="Altro"></datalist>
    <label for="vehicle-notes">Note</label><textarea id="vehicle-notes" name="notes"${disabled}>${escape(vehicle.notes)}</textarea>
    <label class="sf-fleet__check"><input name="active" type="checkbox"${vehicle.active !== false ? ' checked' : ''}${disabled}> Attivo</label>
    <div class="sf-fleet__actions"><button type="button" data-action="cancel"${disabled}>ANNULLA</button><button type="submit"${disabled}>${saving ? 'Salvataggio…' : 'SALVA'}</button></div></form>`;
}
export function readFleetForm(form) { const data = new FormData(form); return { plate: normalizePlate(data.get('plate')), name: String(data.get('name') ?? '').trim(), type: String(data.get('type') ?? '').trim(), notes: String(data.get('notes') ?? '').trim(), active: data.has('active') }; }
export { validateVehicleForm };
