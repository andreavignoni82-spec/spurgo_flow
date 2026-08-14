import assert from 'node:assert/strict';
import { OperatorsController } from '../../../src/features/people/operators/operators.controller.js';
import { TeamsController } from '../../../src/features/people/teams/teams.controller.js';

const form = values => ({ elements: { namedItem: name => ({ value: values[name] ?? '' }) }, querySelectorAll: () => (values.operatorIds || []).map(value => ({ value })) });
const events = [], patches = [], calls = { auth: 0, create: 0, update: 0, active: 0, team: 0 };
const controller = new OperatorsController({ repository: {
  list: () => [], create: value => { calls.create++; return { ...value }; }, update: (id, value) => { calls.update++; return { ...value, id }; }, setActive: (id, active) => { calls.active++; return { id, active }; }
}, teamsRepository: {}, authService: { createOperatorAccount: ({ username }) => { calls.auth++; return { uid: 'uid', email: `${username}@cloud` }; } }, eventBus: { emit: (...args) => events.push(args) }, onChange: patch => patches.push(patch) });
const created = await controller.save(form({ nome: 'Mario', username: ' MARIO ', password: 'secret' }));
assert.equal(created.username, 'mario'); assert.equal(calls.auth, 1); assert.equal(calls.create, 1);
await controller.save(form({ nome: 'Mario', telefono: '123' }), { id: created.id, username: 'mario' });
assert.equal(calls.update, 1); assert.equal(calls.auth, 1);
await controller.setActive(created.id, false); await controller.setActive(created.id, true);
assert.equal(calls.active, 2); assert.equal(calls.auth, 1);

const duplicate = new OperatorsController({ repository: { list: () => [] }, teamsRepository: {}, authService: { createOperatorAccount: () => { const error = new Error('raw'); error.code = 'auth/email-already-in-use'; throw error; } }, onChange: patch => patches.push(patch) });
await duplicate.save(form({ nome: 'M', username: 'm', password: 'x' }));
assert.equal(patches.at(-2).operatorError, 'Username già utilizzato.');

const teamEvents = [];
const teamController = new TeamsController({ repository: { create: value => ({ ...value, id: 'team-1' }), update: (id, value) => ({ ...value, id }), remove: () => ({}) }, eventBus: { emit: (...args) => teamEvents.push(args) }, onChange: patch => patches.push(patch) });
const team = await teamController.save(form({ name: 'Squadra A', operatorIds: [created.id] }));
assert.deepEqual(team.operatorIds, [created.id]);
const empty = await teamController.save(form({ name: 'Squadra vuota', operatorIds: [] }), team); assert.deepEqual(empty.operatorIds, []);
await teamController.remove(team.id); assert.deepEqual(teamEvents.map(row => row[0]), ['team:created', 'team:updated', 'team:deleted']);
console.log('People operators and teams creation, edit, status, duplicate and separation scenarios passed');
