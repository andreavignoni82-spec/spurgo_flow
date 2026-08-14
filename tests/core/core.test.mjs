import assert from 'node:assert/strict';
import { EventBus, DOMAIN_EVENTS } from '../../src/core/event-bus.js';
import { FeatureBoundary, FALLBACK_MESSAGE } from '../../src/core/error-boundary.js';
import { Router } from '../../src/core/router.js';
import { BUILD_LABEL } from '../../src/core/version.js';

const bus = new EventBus();
let delivered = false;
bus.on('test', () => { throw new Error('subscriber failure'); });
bus.on('test', payload => { delivered = payload; });
const errors = bus.emit('test', 7);
assert.equal(delivered, 7);
assert.equal(errors.length, 1);
assert(DOMAIN_EVENTS.includes('intervention:statusChanged'));
assert.equal(BUILD_LABEL, 'v7.0.0-alpha.5 · PEOPLE MODULE');

const container = { textContent: '' };
const logs = [];
const boundary = new FeatureBoundary({ logger: { error: (...args) => logs.push(args) } });
assert.doesNotThrow(() => boundary.run('Agenda', () => { throw new Error('boom'); }, container));
assert.equal(container.textContent, FALLBACK_MESSAGE);
assert.equal(logs.length, 1);

const mounted = [];
const feature = name => ({ id: name, mount: () => mounted.push(name), unmount: () => {} });
const router = new Router({ boundary });
router.register('dashboard', feature('dashboard')).register('control', feature('control'));
router.navigate('dashboard', container);
router.navigate('control', container);
assert.deepEqual(mounted, ['dashboard', 'control']);
console.log('Core Event Bus, boundary and router tests passed');
