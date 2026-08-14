import assert from 'node:assert/strict';
import { buildDashboardModel } from '../../src/features/dashboard/dashboard.model.js';

const now = new Date(2026, 7, 14, 12);
const intervention = (status, extra = {}) => ({ id: status, date: '2026-08-14', time: '09:00', status, ...extra });
const model = data => buildDashboardModel({ now, interventions: [], operators: [], teams: [], vehicles: [], messages: [], ...data });
const value = (result, label) => result.kpis.find(kpi => kpi.label === label).value;

let result = model();
assert.equal(value(result, 'Interventi oggi'), 0);
assert.equal(result.recent.length, 0);

for (const status of ['Urgente', 'Programmato']) {
  result = model({ interventions: [intervention(status)] });
  assert.equal(value(result, 'Interventi oggi'), 1);
  assert.equal(result.recent[0].status, status);
}

result = model({ interventions: [intervention('In corso')] });
assert.equal(value(result, 'In corso'), 1);
result = model({ interventions: [intervention('Terminato')] });
assert.equal(value(result, 'Completati'), 1);

result = model({
  operators: [{ id: 'a', active: true }, { id: 'b', active: true }, { id: 'off', active: false }],
  teams: [{ id: 'one', operatorIds: ['a', 'off'] }, { id: 'inactive', operatorIds: ['off'] }]
});
assert.equal(result.resourceTotals.operators, 3);
assert.equal(value(result, 'Squadre attive'), 1);

assert.doesNotThrow(() => buildDashboardModel());
assert.equal(value(buildDashboardModel(), 'Interventi oggi'), 0);
console.log('Dashboard model scenarios passed');
