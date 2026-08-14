import { filterVehicles, normalizeVehicle, sortVehicles, validateVehicle } from './fleet.model.js';
import { readVehicleForm, renderFleet } from './fleet.view.js';

export class FleetFeature {
  id = 'fleet';
  #container; #context; #vehicles = []; #query = ''; #form; #saving = false; #error = ''; #errors = {};
  #onInput = event => { if (event.target?.matches?.('[data-role="search"]')) { this.#query = event.target.value; this.#render(); } };
  #onClick = event => this.#handleClick(event);
  #onSubmit = event => { if (event.target?.matches?.('[data-role="form"]')) { event.preventDefault(); void this.#save(event.target); } };

  async mount(container, context = {}) {
    if (!container) throw new TypeError('Fleet container is required');
    this.unmount(); this.#container = container; this.#context = context;
    if (!context.repositories?.vehicles?.list) throw new TypeError('Vehicles repository is required');
    container.addEventListener('input', this.#onInput); container.addEventListener('click', this.#onClick); container.addEventListener('submit', this.#onSubmit);
    try { this.#vehicles = await context.repositories.vehicles.list(); this.#render(); }
    catch (error) { this.#fail(error); }
  }
  unmount() {
    this.#container?.removeEventListener('input', this.#onInput); this.#container?.removeEventListener('click', this.#onClick); this.#container?.removeEventListener('submit', this.#onSubmit);
    this.#container = undefined; this.#context = undefined; this.#form = undefined; this.#saving = false;
  }
  async refresh(payload) {
    if (!this.#container) return;
    try { this.#vehicles = Array.isArray(payload?.vehicles) ? payload.vehicles : await this.#context.repositories.vehicles.list(); this.#error = ''; this.#render(); }
    catch (error) { this.#fail(error); }
  }
  #render() { if (this.#container) renderFleet(this.#container, { vehicles: sortVehicles(filterVehicles(this.#vehicles, this.#query)), query: this.#query, form: this.#form, saving: this.#saving, error: this.#error, errors: this.#errors }); }
  #handleClick(event) {
    const button = event.target?.closest?.('[data-action]'); if (!button) return;
    const action = button.dataset.action; const id = button.closest('[data-vehicle-id]')?.dataset.vehicleId;
    if (action === 'new') this.#open(); else if (action === 'edit') this.#open(id); else if (action === 'cancel') { this.#form = undefined; this.#error = ''; this.#render(); }
    else if (action === 'delete') void this.#remove(id);
  }
  #open(id) { this.#form = normalizeVehicle(id ? this.#vehicles.find(vehicle => String(vehicle.id) === String(id)) : { status: 'Operativa' }); this.#error = ''; this.#errors = {}; this.#render(); }
  async #save(form) {
    if (this.#saving) return;
    const data = { ...readVehicleForm(form), ...(this.#form.id ? { id: this.#form.id } : {}) };
    const validation = validateVehicle(data); if (!validation.valid) { this.#errors = validation.errors; this.#render(); return; }
    this.#form = validation.vehicle; this.#saving = true; this.#error = ''; this.#render();
    try {
      const repository = this.#context.repositories.vehicles; const editing = Boolean(data.id);
      const saved = editing ? await repository.update(data.id, validation.vehicle) : await repository.create(validation.vehicle);
      this.#vehicles = editing ? this.#vehicles.map(vehicle => String(vehicle.id) === String(data.id) ? saved : vehicle) : [...this.#vehicles, saved];
      this.#context.eventBus?.emit(editing ? 'vehicle:updated' : 'vehicle:created', { id: saved.id }); this.#form = undefined;
    } catch (error) { this.#error = `Mezzo non salvato: ${error?.message || error}`; }
    finally { this.#saving = false; this.#render(); }
  }
  async #remove(id) {
    if (!id || !globalThis.confirm?.('Eliminare mezzo?')) return;
    try { await this.#context.repositories.vehicles.remove(id); this.#vehicles = this.#vehicles.filter(vehicle => String(vehicle.id) !== String(id)); this.#context.eventBus?.emit('vehicle:deleted', { id }); this.#render(); }
    catch (error) { this.#error = `Eliminazione mezzo non riuscita: ${error?.message || error}`; this.#render(); }
  }
  #fail(error) { this.#context?.services?.logger?.error?.('[fleet] failure', error); if (this.#container) this.#container.textContent = 'Modulo Mezzi temporaneamente non disponibile'; }
}
export const fleetFeature = new FleetFeature();
