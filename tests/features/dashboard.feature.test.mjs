import assert from 'node:assert/strict';
import { EventBus } from '../../src/core/event-bus.js';
import { DashboardFeature } from '../../src/features/dashboard/dashboard.feature.js';

const bus = new EventBus();
const container = { innerHTML: '', textContent: '' };
let loads = 0;
const list = rows => ({ list() { loads += 1; return rows; } });
const context = {
  eventBus: bus,
  repositories: {
    interventions: list([]), operators: list([]), teams: list([]), vehicles: list([]), messages: list([])
  }
};
const feature = new DashboardFeature();
await feature.mount(container, context);
assert.match(container.innerHTML, /sf-dashboard/);
const afterMount = loads;
await feature.mount(container, context);
const afterSecondMount = loads;
bus.emit('intervention:updated');
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(loads - afterSecondMount, 5, 'double mount must retain one subscriber per event');

await feature.refresh({ interventions: [{ id: 'x', date: '2000-01-01', status: 'Urgente' }], operators: [], teams: [], vehicles: [], messages: [] });
assert.match(container.innerHTML, /Urgente/);
assert.ok(afterSecondMount > afterMount, 'idempotent mount may refresh without duplicating listeners');

feature.unmount();
const afterUnmount = loads;
bus.emit('intervention:updated');
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(loads, afterUnmount, 'unmount removes EventBus subscribers');
console.log('Dashboard feature lifecycle passed');
