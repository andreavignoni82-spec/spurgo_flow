import test from 'node:test';
import assert from 'node:assert/strict';
import { createMemoryRepositories } from '../../src/infrastructure/repositories/memory/index.js';
import { VehiclesService } from '../../src/services/vehicles/vehicles-service.js';
import { normalizePlate, searchVehicles, sortVehicles, safeCloneVehicle, countVehicleStates } from '../../src/features/fleet/fleet.model.js';

test('vehicle model helpers normalize, search, sort, count and safely clone', () => {
  assert.equal(normalizePlate('  ab 123 cd '), 'AB 123 CD');
  const source = [{ id: '2', plate: 'ZZ 2', name: 'Beta', type: 'Autobotte', notes: 'blu', active: false }, { id: '1', plate: 'AA 1', name: 'Alfa', type: 'Autospurgo', notes: 'verde', active: true }];
  assert.deepEqual(searchVehicles(source, 'VERDE').map(item => item.id), ['1']);
  assert.deepEqual(searchVehicles(source, 'autobotte').map(item => item.id), ['2']);
  assert.deepEqual(sortVehicles(source).map(item => item.id), ['1', '2']);
  assert.deepEqual(countVehicleStates(source), { total: 2, active: 1, inactive: 1 });
  const copy = safeCloneVehicle(source[0]); copy.name = 'changed'; assert.equal(source[0].name, 'Beta');
});

test('VehiclesService creates, edits, disables, reactivates, emits and keeps identity immutable', async () => {
  const events = []; const repositories = createMemoryRepositories();
  const service = new VehiclesService({ repository: repositories.vehicles, eventBus: { emit: (type) => events.push(type) }, now: () => '2026-08-14T00:00:00.000Z', createId: () => 'vehicle-1' });
  const created = await service.createVehicle({ plate: ' ab 123 cd ', name: 'Uno' });
  assert.equal(created.plate, 'AB 123 CD'); assert.equal(created.active, true); assert.equal(created.createdAt, created.updatedAt);
  await service.updateVehicle(created.id, { plate: ' xy 9 ', name: 'Due' });
  await service.setVehicleActive(created.id, false); await service.setVehicleActive(created.id, true);
  assert.deepEqual((await service.listVehicles()).map(item => [item.id, item.plate, item.active]), [['vehicle-1', 'XY 9', true]]);
  await assert.rejects(service.updateVehicle(created.id, { id: 'other' }), /immutable/);
  assert.deepEqual(events, ['vehicle:created', 'vehicle:updated', 'vehicle:updated', 'vehicle:updated']);
});

test('VehiclesService rejects normalized active duplicate plates and propagates repository failures', async () => {
  const repositories = createMemoryRepositories(); let id = 0;
  const service = new VehiclesService({ repository: repositories.vehicles, createId: () => `v-${++id}` });
  await service.createVehicle({ plate: 'aa 1' });
  await assert.rejects(service.createVehicle({ plate: ' AA 1 ' }), error => error.code === 'VEHICLE_PLATE_ALREADY_EXISTS');
  const inactive = await service.createVehicle({ plate: 'AA 1', active: false });
  await assert.rejects(service.setVehicleActive(inactive.id, true), error => error.code === 'VEHICLE_PLATE_ALREADY_EXISTS');
  const failure = new Error('storage down');
  const broken = new VehiclesService({ repository: { list: async () => { throw failure; }, getById() {}, create() {}, update() {}, remove() {} } });
  await assert.rejects(broken.createVehicle({ plate: 'X' }), failure);
});

test('VehiclesService coalesces a double create submission', async () => {
  let creates = 0; let release; const gate = new Promise(resolve => { release = resolve; });
  const repository = { list: async () => [], getById() {}, create: async value => { creates++; await gate; return value; }, update() {}, remove() {} };
  const service = new VehiclesService({ repository, createId: () => 'one' });
  const first = service.createVehicle({ plate: 'A' }); const second = service.createVehicle({ plate: 'A' });
  assert.equal(first, second); release(); await Promise.all([first, second]); assert.equal(creates, 1);
});
