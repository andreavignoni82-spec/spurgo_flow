import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const feature = await readFile(new URL('../../../src/features/operator/operator.feature.js', import.meta.url), 'utf8');
const agenda = await readFile(new URL('../../../src/features/operator/agenda/operator-agenda.js', import.meta.url), 'utf8');
const report = await readFile(new URL('../../../src/features/operator/report/operator-report.js', import.meta.url), 'utf8');
for (const source of [feature, agenda, report]) assert.doesNotMatch(source, /firebase|AgendaFeature|ReportsFeature|renderOfficeAgenda|refreshControlRoom|refreshReports|renderDashboard/i);
assert.match(feature, /services\.interventions/); assert.match(report, /reports\.saveReport/); assert.match(report, /completeIntervention/);
console.log('Operator dependency contracts passed');
