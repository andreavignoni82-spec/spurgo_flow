import assert from 'node:assert/strict';
import { canOperatorAccessIntervention, selectOperatorInterventions } from '../../../src/features/operator/operator.model.js';
import { OperatorReport } from '../../../src/features/operator/report/operator-report.js';
import { EventBus } from '../../../src/core/event-bus.js';

const teams = [{ id: 'team-a', operatorIds: ['op-a'] }, { id: 'team-b', operatorIds: ['op-b'] }];
const rows = [
  { id: 'direct', operatorId: 'op-a' }, { id: 'multi', assignedOperatorIds: ['op-a'] },
  { id: 'team', teamId: 'team-a' }, { id: 'other', operatorId: 'op-b' }, { id: 'other-team', teamId: 'team-b' }
];
assert.deepEqual(selectOperatorInterventions(rows, 'op-a', teams).map(row => row.id), ['direct', 'multi', 'team']);
assert.equal(canOperatorAccessIntervention('op-a', rows[3], ['team-a']), false);

const order = [];
let saveCalls = 0, completeCalls = 0;
const report = new OperatorReport({
  reportsService: { saveReport: async () => { saveCalls++; order.push('save'); return {}; } },
  interventionsService: { completeIntervention: async () => { completeCalls++; order.push('complete'); return {}; } }
});
await Promise.all([report.complete('job', { relation: 'ok' }), report.complete('job', { relation: 'ok' })]);
assert.deepEqual(order, ['save', 'complete']); assert.equal(saveCalls, 1); assert.equal(completeCalls, 1);

let message = '';
const reportFailure = new OperatorReport({ reportsService: { saveReport: async () => { throw new Error('write'); } }, interventionsService: { completeIntervention: async () => { completeCalls++; } }, onMessage: value => { message = value; } });
await assert.rejects(reportFailure.complete('job', {}), error => error.stage === 'report');
assert.equal(message, 'Rapportino non salvato. Intervento non terminato.'); assert.equal(completeCalls, 1);

const persisted = [];
message = '';
const completionFailure = new OperatorReport({ reportsService: { saveReport: async (_id, value) => { persisted.push(value); } }, interventionsService: { completeIntervention: async () => { throw new Error('close'); } }, onMessage: value => { message = value; } });
await assert.rejects(completionFailure.complete('job', { relation: 'persisted' }), error => error.stage === 'completion');
assert.equal(persisted.length, 1); assert.equal(message, 'Rapportino salvato, ma chiusura intervento non completata.');

const bus = new EventBus(); let operatorRan = false, controlRan = false;
bus.on('intervention:completed', () => { throw new Error('office agenda'); });
bus.on('intervention:completed', () => { operatorRan = true; });
bus.on('intervention:completed', () => { controlRan = true; });
assert.equal(bus.emit('intervention:completed', { id: 'job' }).length, 1);
assert.equal(operatorRan && controlRan, true);
console.log('Operator access, sequential completion, failures, double tap and failure cascade passed');
