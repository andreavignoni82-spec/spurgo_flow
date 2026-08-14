import assert from 'node:assert/strict';
import { buildControlRoomModel, buildResources } from '../../../src/features/control-room/control-room.model.js';

const empty = buildControlRoomModel({ interventions: [], operators: [], teams: [], vehicles: [], planningData: { schedules: {} } });
assert.equal(empty.interventions.length, 0);
const resources = buildResources([{ id: 'o1', nome: 'Mario', active: true }, { id: 'off', active: false }], [{ id: 'a', name: 'Squadra A' }, { id: 'b', name: 'Squadra B' }]);
assert.deepEqual(resources.map(row => row.id), ['team:a', 'team:b', 'op:o1', 'unassigned']);
const intervention = Object.freeze({ id: 'i1', priority: 'Urgente', client: 'Cliente', estimatedMinutes: undefined });
const planningData = { nowMinutes: 500, config: { dayStartMinutes: 360 }, schedules: { 'team:a': [{ job: intervention, start: 500, durationMinutes: 60, durationFallback: true, travelMinutes: 30, arrival: 510, delta: 10, margin: -10, severity: 'delay', overlap: false }] }, statuses: { 'team:a': { severity: 'delay', availability: { state: 'IN INTERVENTO', minutes: 560 } }, 'team:b': { severity: 'ok', availability: { state: 'LIBERO', minutes: 500 } } }, suggestions: [{ interventionId: 'i1', urgent: true, alternatives: [{ resource: resources[1], arrival: 530, travelMinutes: 30, margin: -30, impacted: [] }] }] };
const model = buildControlRoomModel({ interventions: [intervention], operators: [{ id: 'o1', nome: 'Mario' }], teams: [{ id: 'a', name: 'Squadra A' }, { id: 'b', name: 'Squadra B' }], vehicles: [{ id: 'v1' }], planningData });
assert.equal(model.criticalities[0].severity, 'delay'); assert.equal(model.statuses.find(row => row.resourceId === 'team:a').state, 'IN INTERVENTO');
assert.equal(model.statuses.find(row => row.resourceId === 'team:b').state, 'LIBERO'); assert.equal(model.suggestions[0].urgent, true);
assert.equal(intervention.estimatedMinutes, undefined, 'source is not mutated');
console.log('Control Room empty day, resources, urgent/delay/completed-neutral data, availability and missing duration/coordinates model tests passed');
