import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createFleetFeature } from '../../src/features/fleet/fleet.feature.js';

const setup = async ({ records = [], create, subscribe } = {}) => {
  const { document, Event } = parseHTML('<div id="app"></div>').window; globalThis.document = document;
  globalThis.FormData = class { constructor(form) { this.values = new Map([...form.querySelectorAll('[name]')].filter(field => field.type !== 'checkbox' || field.checked).map(field => [field.name, field.value || (field.type === 'checkbox' ? 'on' : '')])); } get(name) { return this.values.get(name) ?? null; } has(name) { return this.values.has(name); } };
  const calls = { unsubscribe: 0, create: 0 };
  const service = { listVehicles: async () => records, createVehicle: async value => { calls.create++; return create ? create(value) : records.push({ ...value, id: 'new' }); }, updateVehicle: async (id, value) => Object.assign(records.find(item => item.id === id), value), setVehicleActive: async (id, active) => { records.find(item => item.id === id).active = active; }, subscribeVehicles: callback => { calls.callback = callback; subscribe?.(callback); return () => calls.unsubscribe++; } };
  const feature = createFleetFeature(); const container = document.querySelector('#app'); await feature.mount(container, { services: { vehicles: service } });
  return { feature, container, calls, Event };
};

test('Fleet mounts, loads empty state, searches, edits status and cleans subscription', async () => {
  const records = [{ id: 'v1', plate: 'AA 1', name: 'Alfa', type: 'Autospurgo', active: true }]; const app = await setup({ records });
  assert.match(app.container.textContent, /MEZZI & FLOTTA/); assert.match(app.container.textContent, /AA 1/);
  const search = app.container.querySelector('[data-fleet-search]'); search.value = 'missing'; search.dispatchEvent(new app.Event('input', { bubbles: true })); assert.match(app.container.textContent, /Nessun mezzo trovato/);
  app.container.querySelector('[data-fleet-search]').value = ''; app.container.querySelector('[data-fleet-search]').dispatchEvent(new app.Event('input', { bubbles: true }));
  app.container.querySelector('[data-action="edit"]').click(); assert.equal(app.container.querySelector('[name="plate"]').value, 'AA 1'); app.container.querySelector('[data-action="cancel"]').click();
  app.container.querySelector('[data-action="toggle"]').click(); await new Promise(resolve => setTimeout(resolve)); assert.equal(records[0].active, false);
  app.feature.unmount(); assert.equal(app.calls.unsubscribe, 1); assert.equal(app.container.textContent, '');
});

test('Fleet preserves a dirty form during realtime snapshot and reports update', async () => {
  const app = await setup(); assert.match(app.container.textContent, /Nessun mezzo presente/); app.container.querySelector('[data-action="new"]').click();
  const plate = app.container.querySelector('[name="plate"]'); plate.value = 'LOCAL'; plate.dispatchEvent(new app.Event('input', { bubbles: true }));
  app.calls.callback({ type: 'snapshot', records: [{ id: 'remote', plate: 'REMOTE', active: true }] });
  assert.equal(app.container.querySelector('[name="plate"]').value, 'LOCAL'); assert.match(app.container.textContent, /aggiornamenti dal server/); app.feature.unmount();
});

test('Fleet keeps form values on save failure and prevents double submit', async () => {
  let reject; const pending = new Promise((_, no) => { reject = no; }); const app = await setup({ create: () => pending });
  app.container.querySelector('[data-action="new"]').click(); const form = app.container.querySelector('[data-fleet-form]'); form.querySelector('[name="plate"]').value = 'AA 1';
  form.dispatchEvent(new app.Event('submit', { bubbles: true, cancelable: true })); form.dispatchEvent(new app.Event('submit', { bubbles: true, cancelable: true }));
  assert.equal(app.calls.create, 1); assert.equal(app.container.querySelector('[data-fleet-form] button[type="submit"]').disabled, true);
  reject(new Error('failed')); await new Promise(resolve => setTimeout(resolve)); assert.equal(app.container.querySelector('[name="plate"]').value, 'AA 1'); assert.match(app.container.textContent, /Salvataggio non riuscito/); app.feature.unmount();
});
