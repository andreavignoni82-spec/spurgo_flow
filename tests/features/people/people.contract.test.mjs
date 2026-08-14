import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { normalizeOperatorUsername } from '../../../src/shared/utils/operator-username.js';
import { AuthService } from '../../../src/services/firebase/auth-service.js';
import { AvailabilityService } from '../../../src/services/availability-service.js';
import { OperatorsRepository } from '../../../src/services/repositories/operators-repository.js';
import { TeamsRepository } from '../../../src/services/repositories/teams-repository.js';

assert.equal(normalizeOperatorUsername(' Mario '), 'mario');
assert.equal(normalizeOperatorUsername('MARIO'), 'mario');
let authInput;
const auth = new AuthService({ auth: { createOperatorAccount: input => (authInput = input), signIn: input => input, signOut() {} } });
await auth.createOperatorAccount({ username: ' Mario ', password: 'secret' });
assert.equal(authInput.username, 'mario');
assert.equal((await auth.login({ username: ' MARIO ', password: 'x' })).username, 'mario');
assert.equal(auth.cloudEmail(' Mario '), 'mario@operator.spurgoflow.local');

let authCalls = 0;
const operators = new OperatorsRepository({ list: () => [], update: (_id, patch) => patch, setActive: (_id, active) => ({ active }) });
assert.deepEqual(await operators.update('op-1', { telefono: '123' }), { telefono: '123' });
assert.equal(authCalls, 0);
const teams = new TeamsRepository({ list: () => [], update: (_id, patch) => patch });
assert.deepEqual(await teams.update('t-1', { operatorIds: ['op-1'] }), { operatorIds: ['op-1'] });
assert.equal(authCalls, 0);
const events = [];
const availability = new AvailabilityService({ set: (_id, value) => value, eventBus: { emit: (name, payload) => events.push([name, payload]) } });
assert.equal(await availability.set('op-1', false), false); assert.equal(authCalls, 0);
assert.deepEqual(events, [['operator:availabilityChanged', { id: 'op-1' }]]);

const files = ['people.feature.js', 'people.view.js', 'people.model.js', 'operators/operators.controller.js', 'teams/teams.controller.js'];
for (const file of files) {
  const source = readFileSync(new URL(`../../../src/features/people/${file}`, import.meta.url), 'utf8');
  assert.doesNotMatch(source, /firebase|features\/(dashboard|clients|fleet|interventions|agenda|control-room)/i);
}
assert.doesNotMatch(readFileSync(new URL('../../../src/features/people/people.view.js', import.meta.url), 'utf8'), /repositories/);
assert.doesNotMatch(readFileSync(new URL('../../../src/features/people/people.model.js', import.meta.url), 'utf8'), /document|window\./);
console.log('People/Auth/Availability separation and architecture contracts passed');
