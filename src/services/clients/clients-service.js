import { normalizeClient, validateClient } from '../../domain/clients/client.js';
import { assertRepositoryContract } from '../../domain/contracts/repositories.js';
import { Events, eventEnvelope } from '../../core/events.js';

const allowed = new Set(['name','fiscalName','phone','email','address','city','notes','active']);
const cleanInput = input => Object.fromEntries(Object.entries(input ?? {}).filter(([key]) => allowed.has(key)));
export class ClientsService {
  #repository; #eventBus; #createPending;
  constructor({ repository, eventBus, now = () => new Date().toISOString(), createId = () => crypto.randomUUID(), realtime } = {}) {
    this.#repository = assertRepositoryContract('clients', repository); this.#eventBus = eventBus; this.now = now; this.createId = createId; this.realtime = realtime;
  }
  listClients() { return this.#repository.list(); }
  getClient(id) { if (!id?.trim()) throw new TypeError('Client id is required'); return this.#repository.getById(id); }
  createClient(data) {
    if (this.#createPending) return this.#createPending;
    const timestamp = this.now(); const client = normalizeClient({ ...cleanInput(data), id: this.createId(), active: data?.active !== false, createdAt: timestamp, updatedAt: timestamp }); validateClient(client);
    this.#createPending = this.#repository.create(client).then(result => { this.#eventBus?.emit(Events.CLIENT_CREATED, eventEnvelope(result.id, 'clients-service', result)); return result; }).finally(() => { this.#createPending = undefined; });
    return this.#createPending;
  }
  async updateClient(id, patch) { if (!id?.trim()) throw new TypeError('Client id is required'); const value = cleanInput(patch); value.updatedAt = this.now(); const result = await this.#repository.update(id, value); this.#eventBus?.emit(Events.CLIENT_UPDATED, eventEnvelope(id, 'clients-service', value)); return result; }
  setClientActive(id, active) { if (typeof active !== 'boolean') throw new TypeError('Client active must be boolean'); return this.updateClient(id, { active }); }
  async removeClient(id) { const result = await this.#repository.remove(id); this.#eventBus?.emit(Events.CLIENT_DELETED, eventEnvelope(id, 'clients-service')); return result; }
  subscribeClients(callback) { return this.realtime?.subscribeCollection?.('clients', callback) ?? null; }
}
