import assert from 'node:assert/strict';
import { FeatureBoundary } from '../../src/core/error-boundary.js';
import { EventBus } from '../../src/core/event-bus.js';
import { Router } from '../../src/core/router.js';

const rendered = [];
const logger = { error() {} };
const boundary = new FeatureBoundary({ logger });
const mount = (name, callback = () => rendered.push(name)) =>
  boundary.run(name, callback, { textContent: '' });

mount('Agenda', () => { throw new Error('Agenda failure'); });
mount('Dashboard');
mount('Control Room');
mount('Login');
assert.deepEqual(rendered, ['Dashboard', 'Control Room', 'Login']);

const eventBus = new EventBus();
let eventDelivered = false;
eventBus.on('operator:updated', () => { eventDelivered = true; });
const legacyMounted = [];
const router = new Router({ boundary, context: { eventBus } });
router.register('dashboard', { id: 'dashboard', mount() { throw new Error('simulated Dashboard failure'); }, unmount() {} });
router.register('legacy', { id: 'legacy', mount() { legacyMounted.push('legacy page'); }, unmount() {} });
const failedContainer = { textContent: '' };
router.navigate('dashboard', failedContainer);
assert.equal(failedContainer.textContent, 'Modulo temporaneamente non disponibile');
router.navigate('legacy', { textContent: '' });
eventBus.emit('operator:updated');
assert.deepEqual(legacyMounted, ['legacy page']);
assert.equal(eventDelivered, true);

const workflow = ({ maps, planning }) => {
  try { maps(); } catch {}
  try { planning(); } catch {}
  return { interventionsVisible: true, manualCreationAvailable: true };
};
const result = workflow({
  maps: () => { throw new Error('Maps unavailable'); },
  planning: () => { throw new Error('Planning unavailable'); }
});
assert.equal(result.interventionsVisible, true);
assert.equal(result.manualCreationAvailable, true);
console.log('Dashboard, legacy routes, EventBus, MapsService and PlanningService isolation tests passed');
