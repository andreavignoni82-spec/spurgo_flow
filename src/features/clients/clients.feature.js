import { filterClients, normalizeClient, sortClients, validateClient } from './clients.model.js';
import { readClientForm, renderClients } from './clients.view.js';

export class ClientsFeature {
  id = 'clients';
  #container; #context; #clients = []; #query = ''; #form; #saving = false; #error = ''; #errors = {};
  #onInput = event => { if (event.target?.matches?.('[data-role="search"]')) { this.#query = event.target.value; this.#render(); } };
  #onClick = event => this.#handleClick(event);
  #onSubmit = event => { if (event.target?.matches?.('[data-role="form"]')) { event.preventDefault(); void this.#save(event.target); } };

  async mount(container, context = {}) {
    if (!container) throw new TypeError('Clients container is required');
    this.unmount(); this.#container = container; this.#context = context;
    if (!context.repositories?.clients?.list) throw new TypeError('Clients repository is required');
    container.addEventListener('input', this.#onInput); container.addEventListener('click', this.#onClick); container.addEventListener('submit', this.#onSubmit);
    try { this.#clients = await context.repositories.clients.list(); this.#render(); }
    catch (error) { this.#fail(error); }
  }
  unmount() {
    this.#container?.removeEventListener('input', this.#onInput); this.#container?.removeEventListener('click', this.#onClick); this.#container?.removeEventListener('submit', this.#onSubmit);
    this.#container = undefined; this.#context = undefined; this.#form = undefined; this.#saving = false;
  }
  #render() { if (this.#container) renderClients(this.#container, { clients: sortClients(filterClients(this.#clients, this.#query)), query: this.#query, form: this.#form, saving: this.#saving, error: this.#error, errors: this.#errors }); }
  #handleClick(event) {
    const button = event.target?.closest?.('[data-action]'); if (!button) return;
    const action = button.dataset.action; const id = button.closest('[data-client-id]')?.dataset.clientId;
    if (action === 'new') this.#open(); else if (action === 'edit') this.#open(id); else if (action === 'cancel') { this.#form = undefined; this.#error = ''; this.#render(); }
    else if (action === 'delete') void this.#remove(id); else if (action === 'intervention') this.#context.eventBus?.emit('client:interventionRequested', { id });
  }
  #open(id) { this.#form = normalizeClient(id ? this.#clients.find(client => String(client.id) === String(id)) : {}); this.#error = ''; this.#errors = {}; this.#render(); }
  async #save(form) {
    if (this.#saving) return;
    const data = { ...readClientForm(form), ...(this.#form.id ? { id: this.#form.id } : {}) };
    const validation = validateClient(data); if (!validation.valid) { this.#errors = validation.errors; this.#render(); return; }
    this.#form = validation.client;
    this.#saving = true; this.#error = ''; this.#render();
    try {
      const repository = this.#context.repositories.clients; const editing = Boolean(data.id);
      const saved = editing ? await repository.update(data.id, data) : await repository.create(data);
      this.#clients = editing ? this.#clients.map(client => client.id === data.id ? saved : client) : [...this.#clients, saved];
      this.#context.eventBus?.emit(editing ? 'client:updated' : 'client:created', { id: saved.id }); this.#form = undefined;
    } catch (error) { this.#error = `Cliente non salvato: ${error?.message || error}`; }
    finally { this.#saving = false; this.#render(); }
  }
  async #remove(id) {
    if (!id || !globalThis.confirm?.('Eliminare cliente?')) return;
    try { await this.#context.repositories.clients.remove(id); this.#clients = this.#clients.filter(client => client.id !== id); this.#context.eventBus?.emit('client:deleted', { id }); this.#render(); }
    catch (error) { this.#error = `Eliminazione cliente non riuscita: ${error?.message || error}`; this.#render(); }
  }
  #fail(error) { this.#context?.services?.logger?.error?.('[clients] failure', error); if (this.#container) this.#container.textContent = 'Modulo Clienti temporaneamente non disponibile'; }
}
export const clientsFeature = new ClientsFeature();
