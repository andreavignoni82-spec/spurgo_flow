import assert from 'node:assert/strict';
import { FeatureBoundary } from '../../src/core/error-boundary.js';

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
console.log('Feature, MapsService and PlanningService isolation tests passed');
