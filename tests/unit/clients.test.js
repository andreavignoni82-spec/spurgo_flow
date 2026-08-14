import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeClient, searchClients, sortClients } from '../../src/features/clients/clients.model.js';
import { validateClientForm } from '../../src/features/clients/clients.validators.js';
import { ClientsService } from '../../src/services/clients/clients-service.js';
import { createClientsMemoryRepository } from '../../src/infrastructure/repositories/memory/index.js';
import { EventBus } from '../../src/core/event-bus.js';
import { Events } from '../../src/core/events.js';

const clock = () => '2026-08-14T10:00:00.000Z';
test('client normalization, local search, sort and validation use the alpha.2.1 fields', () => {
  const client = normalizeClient({ name: '  Zeta  ', email: ' info@zeta.it ', city: ' Roma ' });
  assert.equal(client.name, 'Zeta'); assert.equal(client.active, true);
  const clients = [client, normalizeClient({ name: 'Alfa', phone: '123', active: false })];
  assert.deepEqual(sortClients(clients).map(item => item.name), ['Alfa', 'Zeta']);
  assert.deepEqual(searchClients(clients, 'roma').map(item => item.name), ['Zeta']);
  assert.deepEqual(searchClients(clients, '123').map(item => item.name), ['Alfa']);
  assert.equal(validateClientForm({ name: '', email: 'bad' }).name, 'Il nome è obbligatorio');
  assert.deepEqual(validateClientForm({ name: 'OK', email: '' }), {});
});

test('ClientsService creates, updates, disables and emits semantic events', async () => {
  const eventBus = new EventBus(); const repository = createClientsMemoryRepository(); const seen = [];
  eventBus.on(Events.CLIENT_CREATED, value => seen.push(value));
  const service = new ClientsService({ repository, eventBus, now: clock, createId: () => 'c-1' });
  const created = await service.createClient({ name: 'Acme', active: true });
  assert.equal(created.id, 'c-1'); assert.equal(created.createdAt, clock());
  assert.equal((await service.updateClient('c-1', { city: 'Milano', id: 'hacked' })).id, 'c-1');
  assert.equal((await service.setClientActive('c-1', false)).active, false);
  assert.equal((await service.listClients())[0].city, 'Milano'); assert.equal(seen.length, 1);
});

test('ClientsService propagates repository failures and coalesces duplicate create submission', async () => {
  let calls = 0; let release;
  const repository = { list: async()=>[], getById:async()=>null, update:async()=>{}, remove:async()=>{}, create: () => { calls += 1; return new Promise(resolve => { release = resolve; }); } };
  const service = new ClientsService({ repository, now: clock, createId: () => 'c-2' });
  const first = service.createClient({ name: 'Once' }); const second = service.createClient({ name: 'Once' });
  assert.equal(first, second); assert.equal(calls, 1); release({ id: 'c-2' }); await first;
  repository.list = async () => { throw new Error('offline'); }; await assert.rejects(service.listClients(), /offline/);
});
