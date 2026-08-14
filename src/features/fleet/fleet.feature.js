import { shellTemplate } from '../../shared/ui/placeholder.js';
import { fleetView } from './fleet.view.js';
import { readFleetForm, validateVehicleForm } from './fleet.form.js';
import { selectVisibleVehicles } from './fleet.model.js';

const friendlySaveError = error => error?.code === 'VEHICLE_PLATE_ALREADY_EXISTS' ? 'Esiste già un mezzo attivo con questa targa.' : 'Salvataggio non riuscito. Riprova.';
export function createFleetFeature() {
  let root; let service; let state; let unsubscribe; let generation = 0;
  const render = ({ focus } = {}) => { if (!root) return; state.visible = selectVisibleVehicles(state.vehicles, state.query); root.innerHTML = shellTemplate('fleet', fleetView(state)); if (focus) root.querySelector(focus)?.focus(); };
  const reload = async () => { try { state.vehicles = await service.listVehicles(); state.loadError = false; } catch { state.loadError = true; } finally { state.loading = false; render(); } };
  const captureForm = () => { const form = root?.querySelector('[data-fleet-form]'); if (form && state.form) state.form = { ...state.form, ...readFleetForm(form) }; };
  const submit = async form => {
    if (state.saving) return; const value = readFleetForm(form); const errors = validateVehicleForm(value);
    if (Object.keys(errors).length) { state.form = { ...state.form, ...value }; state.saveError = Object.values(errors)[0]; render({ focus: '#vehicle-plate' }); return; }
    state.saving = true; state.form = { ...state.form, ...value }; state.saveError = ''; render();
    try { state.form.id ? await service.updateVehicle(state.form.id, value) : await service.createVehicle(value); state.form = null; state.dirty = false; state.remoteUpdate = false; state.saving = false; await reload(); root?.querySelector('[data-action="new"]')?.focus(); }
    catch (error) { state.saving = false; state.saveError = friendlySaveError(error); render({ focus: '#vehicle-plate' }); }
  };
  const onInput = event => {
    if (event.target.matches('[data-fleet-search]')) { captureForm(); state.query = event.target.value; render({ focus: '[data-fleet-search]' }); }
    else if (event.target.closest('[data-fleet-form]')) state.dirty = true;
  };
  const onClick = async event => {
    const action = event.target.closest('[data-action]')?.dataset.action; if (!action) return;
    if (action === 'new') { state.form = { active: true }; state.dirty = false; state.saveError = ''; render({ focus: '#vehicle-plate' }); return; }
    if (action === 'cancel') { state.form = null; state.dirty = false; state.saveError = ''; state.remoteUpdate = false; render({ focus: '[data-action="new"]' }); return; }
    const id = event.target.closest('[data-vehicle-id]')?.dataset.vehicleId; const vehicle = state.vehicles.find(item => item.id === id);
    if (action === 'edit' && vehicle) { state.form = { ...vehicle }; state.dirty = false; state.saveError = ''; render({ focus: '#vehicle-plate' }); }
    if (action === 'toggle' && vehicle) { try { await service.setVehicleActive(id, vehicle.active === false); await reload(); } catch { state.loadError = true; render(); } }
  };
  const onSubmit = event => { if (event.target.matches('[data-fleet-form]')) { event.preventDefault(); submit(event.target); } };
  return { id: 'fleet', async mount(container, context) {
    service = context.services?.vehicles; if (!service) throw new Error('VehiclesService unavailable'); generation += 1;
    root = document.createElement('section'); root.className = 'app-shell'; root.dataset.feature = 'fleet'; container.replaceChildren(root);
    state = { vehicles: [], visible: [], query: '', loading: true, loadError: false, realtimeError: false, remoteUpdate: false, form: null, dirty: false, saving: false, saveError: '' }; render();
    root.addEventListener('input', onInput); root.addEventListener('change', onInput); root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit);
    const current = generation; unsubscribe = service.subscribeVehicles?.(message => { if (!root || generation !== current) return; if (message.type === 'error') { state.realtimeError = true; render(); } else if (message.type === 'snapshot') { state.vehicles = message.records; state.loading = false; if (state.form && state.dirty) { state.remoteUpdate = true; const notice = root.querySelector('[data-realtime-notice]'); notice?.removeAttribute('hidden'); } else render(); } });
    context.lifecycle?.addCleanup(() => this.unmount()); await reload();
  }, unmount() { generation += 1; unsubscribe?.(); unsubscribe = undefined; root?.removeEventListener('input', onInput); root?.removeEventListener('change', onInput); root?.removeEventListener('click', onClick); root?.removeEventListener('submit', onSubmit); root?.remove(); root = undefined; service = undefined; state = undefined; } };
}
export const fleetFeature = createFleetFeature();
