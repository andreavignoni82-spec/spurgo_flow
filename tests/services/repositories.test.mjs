import assert from 'node:assert/strict';
import { InterventionsRepository } from '../../src/services/repositories/interventions-repository.js';
import { LegacyAdapter } from '../../src/services/legacy-adapter.js';
assert.throws(() => new InterventionsRepository().listByDate('2026-08-14'), /not implemented/);
const interventions = [{ id: 'v6' }];
assert.equal(new LegacyAdapter({ sfOfficeInterventions: interventions }).interventions(), interventions);
console.log('Repository and legacy compatibility contracts passed');
