import assert from 'node:assert/strict';
import { filterClients, normalizeClient, sortClients, validateClient } from '../../../src/features/clients/clients.model.js';

assert.deepEqual(filterClients([], 'x'), []);
const rows = [{ id: '2', name: 'Zulu', city: 'Iseo' }, { id: '1', name: 'alfa', phone: '123' }];
assert.deepEqual(sortClients(rows).map(x => x.id), ['1', '2']);
assert.deepEqual(filterClients(rows, 'iseo').map(x => x.id), ['2']);
assert.equal(validateClient({ name: '' }).valid, false);
assert.equal(validateClient({ name: ' Cliente ' }).client.name, 'Cliente');
assert.ok(Object.isFrozen(normalizeClient(rows[0])));
console.log('Clients model empty list, list, search, sorting and validation passed');
