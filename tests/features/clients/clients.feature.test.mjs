import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { ClientsFeature } from '../../../src/features/clients/clients.feature.js';

class Container {
  listeners = new Map(); innerHTML = ''; textContent = '';
  addEventListener(name, fn) { (this.listeners.get(name) ?? this.listeners.set(name, new Set()).get(name)).add(fn); }
  removeEventListener(name, fn) { this.listeners.get(name)?.delete(fn); }
  emit(name, target) { for (const fn of this.listeners.get(name) ?? []) fn({ target, preventDefault() {} }); }
}
globalThis.FormData = class { constructor(form) { this.values = form.values; } entries() { return Object.entries(this.values); } };
globalThis.confirm = () => true;
const tick = () => new Promise(resolve => setTimeout(resolve, 0));
const container = new Container(); const bus = new EventBus(); const emitted = [];
bus.on('client:created', value => emitted.push(['created', value])); bus.on('client:updated', value => emitted.push(['updated', value]));
let creates = 0; let updates = 0;
const repository = {
  list: async () => [{ id: 'a', name: 'Alpha' }],
  create: async data => { creates++; await tick(); return { ...data, id: 'new' }; },
  update: async (id, data) => { updates++; return { ...data, id }; }, remove: async id => ({ id })
};
const feature = new ClientsFeature(); await feature.mount(container, { eventBus: bus, repositories: { clients: repository } });
assert.match(container.innerHTML, /Alpha/);
const counts = Object.fromEntries([...container.listeners].map(([key, value]) => [key, value.size]));
await feature.mount(container, { eventBus: bus, repositories: { clients: repository } });
assert.deepEqual(Object.fromEntries([...container.listeners].map(([key, value]) => [key, value.size])), counts, 'repeat mount does not duplicate listeners');

const newButton = { dataset: { action: 'new' }, closest(selector) { return selector === '[data-action]' ? this : null; } };
container.emit('click', newButton);
const form = { values: { name: 'Beta', address: '', city: '', phone: '', email: '', contact: '', notes: '' }, matches: selector => selector === '[data-role="form"]' };
container.emit('submit', form); container.emit('submit', form); await tick(); await tick();
assert.equal(creates, 1, 'double save creates once'); assert.deepEqual(emitted[0], ['created', { id: 'new' }]);

feature.unmount(); assert.ok([...container.listeners.values()].every(set => set.size === 0), 'unmount cleans listeners');

const failureContainer = new Container(); const failing = new ClientsFeature();
await failing.mount(failureContainer, { eventBus: bus, repositories: { clients: { list: async () => [], create: async () => { throw new Error('offline'); } } } });
failureContainer.emit('click', newButton); failureContainer.emit('submit', form); await tick();
assert.match(failureContainer.innerHTML, /Cliente non salvato: offline/); assert.match(failureContainer.innerHTML, /value="Beta"/, 'failed save keeps form data');
console.log('Clients CRUD, save failure, double click and lifecycle cleanup passed');
