import assert from 'node:assert/strict';
import { PeopleFeature } from '../../../src/features/people/people.feature.js';

function container() {
  const listeners = new Map();
  return { innerHTML: '', addEventListener(name, handler) { listeners.set(name, handler); }, removeEventListener(name, handler) { if (listeners.get(name) === handler) listeners.delete(name); }, listeners };
}
const dependencies = (operators = []) => ({ repositories: { operators: { list: async () => operators }, teams: { list: async () => [] } }, services: { auth: { createOperatorAccount() {} }, logger: { error() {} } }, eventBus: { emit() {} } });

const feature = new PeopleFeature(), host = container();
await feature.mount(host, dependencies([{ id: 'op-1', nome: 'Mario', username: 'mario' }]));
assert.match(host.innerHTML, /Mario/); assert.equal(host.listeners.size, 2);
feature.unmount(); assert.equal(host.listeners.size, 0);

const failed = container();
await feature.mount(failed, dependencies(Object.assign([], { unused: true })));
feature.unmount();
const isolated = new PeopleFeature();
await isolated.mount(failed, { ...dependencies(), repositories: { ...dependencies().repositories, operators: { list: async () => { throw new Error('offline'); } } } });
assert.match(failed.innerHTML, /Modulo Operatori & Squadre temporaneamente non disponibile/);
assert.equal(failed.listeners.size, 2);
isolated.unmount(); assert.equal(failed.listeners.size, 0);
console.log('People list, mount/unmount, listener cleanup and isolated repository failure passed');
