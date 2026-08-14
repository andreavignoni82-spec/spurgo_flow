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

// Pending photos become persisted after save and are not appended again by repeated saves/completion.
const originalFileReader = globalThis.FileReader;
const originalURL = globalThis.URL;
globalThis.URL = { createObjectURL: file => `blob:${file.name}`, revokeObjectURL: () => {} };
globalThis.FileReader = class { readAsDataURL(file) { this.result = `data:${file.name}`; queueMicrotask(() => this.onload()); } };
let photoChange;
const photoInput = { value: 'selected', addEventListener: (_name, listener) => { photoChange = listener; }, removeEventListener: () => {} };
const photoContainer = { querySelector: () => photoInput, querySelectorAll: () => [] };
const photoSaves = [];
const photoReport = new OperatorReport({
  reportsService: { saveReport: async (_id, value) => { const saved = structuredClone(value); photoSaves.push(saved); return saved; } },
  interventionsService: { completeIntervention: async () => ({}) }
});
photoReport.mountEnhancements(photoContainer);
photoChange({ target: { files: [{ name: 'one.jpg', type: 'image/jpeg', size: 1 }, { name: 'two.jpg', type: 'image/jpeg', size: 2 }] } });
let reopened = {};
for (let index = 0; index < 3; index++) reopened = await photoReport.save('photos', await photoReport.collect(reopened));
await photoReport.complete('photos', await photoReport.collect(reopened));
assert.deepEqual(photoSaves.map(item => item.photos.length), [2, 2, 2, 2]);
assert.deepEqual(photoSaves.at(-1).photos.map(item => item.data), ['data:one.jpg', 'data:two.jpg']);
photoReport.destroy(); globalThis.FileReader = originalFileReader; globalThis.URL = originalURL;
console.log('Operator pending-photo persistence and duplicate prevention passed');

// Dirty forms survive a realtime event storm and retain every persisted baseline field.
const { OperatorIntervention } = await import('../../../src/features/operator/intervention/operator-intervention.js');
const values = new Map([
  ['relation', 'ABC'], ['activities', 'Lavaggio\n{"code":"VIDEO"}'], ['anomaly', 'Perdita'],
  ['anomalies', 'Perdita'], ['materials', 'Guarnizione'], ['notes', 'nota'], ['customerSigner', 'Mario']
]);
const notice = { hidden: true, textContent: '' };
const dirtyContainer = { querySelector: selector => selector === '[data-role="server-update"]' ? notice : { value: values.get(selector.match(/name="([^"]+)/)?.[1]) ?? '' } };
const persistedBaseline = { relation: 'prima', activities: ['Lavaggio'], anomaly: 'Perdita', anomalies: ['Perdita'], materials: ['Guarnizione'], notes: 'nota', photos: [{ data: 'photo' }], operatorSignature: 'operator-sign', customerSignature: 'customer-sign', customerSigner: 'Mario', generatedAt: 'baseline', extensionField: { retained: true } };
const dirtyView = new OperatorIntervention();
dirtyView.container = dirtyContainer; dirtyView.state = { intervention: { id: 'current' }, report: persistedBaseline, reportAvailable: true };
dirtyView.onEdit({ target: { matches: () => true } });
for (let index = 0; index < 20; index++) dirtyView.updateServerState({ intervention: { id: 'current', revision: index }, report: { relation: `server-${index}` } });
const dirtyData = dirtyView.reportData();
assert.equal(dirtyView.formDirty, true); assert.equal(dirtyData.relation, 'ABC'); assert.equal(notice.hidden, false);
assert.deepEqual(dirtyData.photos, persistedBaseline.photos); assert.equal(dirtyData.operatorSignature, 'operator-sign'); assert.equal(dirtyData.customerSignature, 'customer-sign'); assert.deepEqual(dirtyData.extensionField, { retained: true });
console.log('Operator dirty-state, reopening preservation and 20-event storm passed');
