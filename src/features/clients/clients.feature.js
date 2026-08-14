import { shellTemplate } from '../../shared/ui/placeholder.js';
import { clientsView } from './clients.view.js';
import { readClientForm, validateClientForm } from './clients.form.js';
import { selectVisibleClients } from './clients.model.js';

export function createClientsFeature() {
  let root; let service; let state; let unsubscribe; let generation = 0;
  const render = () => { if (!root) return; state.visible = selectVisibleClients(state.clients, state.query); root.innerHTML = shellTemplate('clients', clientsView(state)); };
  const reload = async () => { try { state.clients = await service.listClients(); state.loadError = false; } catch { state.loadError = true; } finally { state.loading = false; render(); } };
  const submit = async form => {
    if (state.saving) return; const value = readClientForm(form); const errors = validateClientForm(value);
    if (Object.keys(errors).length) { state.saveError = Object.values(errors)[0]; render(); return; }
    state.saving = true; state.saveError = ''; render();
    try { state.form.id ? await service.updateClient(state.form.id, value) : await service.createClient(value); state.form = null; await reload(); }
    catch { state.saving = false; state.saveError = 'Salvataggio non riuscito. Riprova.'; state.form = { ...state.form, ...value }; render(); }
  };
  const onInput = event => { if (event.target.matches('[data-client-search]')) { state.query = event.target.value; render(); root.querySelector('[data-client-search]')?.focus(); } };
  const onClick = async event => {
    const action = event.target.closest('[data-action]')?.dataset.action; if (!action) return;
    if (action === 'new') { state.form = { active: true }; state.saveError = ''; render(); }
    if (action === 'cancel') { state.form = null; state.saveError = ''; render(); }
    const id = event.target.closest('[data-client-id]')?.dataset.clientId; const client = state.clients.find(item => item.id === id);
    if (action === 'edit' && client) { state.form = { ...client }; state.saveError = ''; render(); }
    if (action === 'toggle' && client) { try { await service.setClientActive(id, client.active === false); await reload(); } catch { state.loadError = true; render(); } }
  };
  const onSubmit = event => { if (event.target.matches('[data-client-form]')) { event.preventDefault(); submit(event.target); } };
  return { id: 'clients', async mount(container, context) {
    service = context.services?.clients; if (!service) throw new Error('ClientsService unavailable');
    generation += 1; root = document.createElement('section'); root.className = 'app-shell'; root.dataset.feature = 'clients'; container.replaceChildren(root);
    state = { clients: [], visible: [], query: '', loading: true, loadError: false, realtimeError: false, form: null, saving: false, saveError: '' }; render();
    root.addEventListener('input', onInput); root.addEventListener('click', onClick); root.addEventListener('submit', onSubmit);
    const current = generation; unsubscribe = service.subscribeClients?.(message => { if (!root || generation !== current) return; if (message.type === 'error') { state.realtimeError = true; render(); } else if (message.type === 'snapshot') { state.clients = message.records; state.loading = false; render(); } });
    context.lifecycle?.addCleanup(() => this.unmount()); await reload();
  }, unmount() { generation += 1; unsubscribe?.(); unsubscribe = undefined; root?.removeEventListener('input', onInput); root?.removeEventListener('click', onClick); root?.removeEventListener('submit', onSubmit); root?.remove(); root = undefined; service = undefined; state = undefined; } };
}
export const clientsFeature = createClientsFeature();
