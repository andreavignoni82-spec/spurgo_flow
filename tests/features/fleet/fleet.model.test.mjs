import assert from 'node:assert/strict';
import { filterVehicles, normalizeVehicle, sortVehicles, validateVehicle } from '../../../src/features/fleet/fleet.model.js';
assert.deepEqual(normalizeVehicle({ name: ' A ', hours: '12' }).name, 'A');
assert.equal(normalizeVehicle({ hours: '12' }).hours, 12);
assert.equal(filterVehicles([{ name: 'Autobotte', plate: 'ZA 1' }], 'za').length, 1);
assert.deepEqual(sortVehicles([{ name: 'Zulu' }, { name: 'Alpha' }]).map(x => x.name), ['Alpha', 'Zulu']);
assert.equal(validateVehicle({ name: '' }).valid, false);
assert.equal(validateVehicle({ name: 'Autobotte', hours: 0 }).valid, true);
console.log('Fleet pure model normalization, filter, sort and validation passed');
