import assert from 'node:assert/strict';
import { InterventionsRepository } from '../../src/services/repositories/interventions-repository.js';
import { LegacyAdapter } from '../../src/services/legacy-adapter.js';
assert.throws(() => new InterventionsRepository().listByDate('2026-08-14'), /not implemented/);
const interventions = [{ id: 'v6', nested: { status: 'Urgente' } }];
const adapterRows = new LegacyAdapter({ sfOfficeInterventions: interventions }).interventions();
assert.deepEqual(adapterRows, interventions);
assert.notEqual(adapterRows, interventions);
adapterRows[0].nested.status = 'Terminato';
assert.equal(interventions[0].nested.status, 'Urgente');

const repository = new InterventionsRepository({ list: () => interventions });
const dto = repository.list();
dto[0].nested.status = 'In corso';
assert.equal(interventions[0].nested.status, 'Urgente');
console.log('Repository and legacy compatibility contracts passed');
