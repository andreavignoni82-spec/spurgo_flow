import { normalizeVehicle, normalizeVehiclePlate, validateVehicle } from '../../domain/vehicles/vehicle.js';
import { assertRepositoryContract } from '../../domain/contracts/repositories.js';
import { Events, eventEnvelope } from '../../core/events.js';

const allowed = new Set(['plate', 'name', 'type', 'notes', 'active']);
const cleanInput = input => Object.fromEntries(Object.entries(input ?? {}).filter(([key]) => allowed.has(key)));
export const normalizePlate = normalizeVehiclePlate;

export class VehiclePlateAlreadyExistsError extends Error {
  constructor() { super('Esiste già un mezzo attivo con questa targa.'); this.name = 'VehiclePlateAlreadyExistsError'; this.code = 'VEHICLE_PLATE_ALREADY_EXISTS'; }
}

export class VehiclesService {
  #repository; #eventBus; #createPending;
  constructor({ repository, eventBus, now = () => new Date().toISOString(), createId = () => crypto.randomUUID(), realtime } = {}) {
    this.#repository = assertRepositoryContract('vehicles', repository); this.#eventBus = eventBus; this.now = now; this.createId = createId; this.realtime = realtime;
  }
  listVehicles() { return this.#repository.list(); }
  getVehicle(id) { if (!id?.trim()) throw new TypeError('Vehicle id is required'); return this.#repository.getById(id); }
  async #assertUniqueActivePlate(plate, active, excludedId) {
    if (!active) return;
    const normalized = normalizePlate(plate);
    const duplicate = (await this.#repository.list()).some(vehicle => vehicle.id !== excludedId && vehicle.active !== false && normalizePlate(vehicle.plate) === normalized);
    if (duplicate) throw new VehiclePlateAlreadyExistsError();
  }
  createVehicle(data) {
    if (this.#createPending) return this.#createPending;
    this.#createPending = (async () => {
      const input = cleanInput(data); input.plate = normalizePlate(input.plate); input.active = data?.active !== false;
      await this.#assertUniqueActivePlate(input.plate, input.active);
      const timestamp = this.now();
      const vehicle = normalizeVehicle({ ...input, id: this.createId(), createdAt: timestamp, updatedAt: timestamp }); validateVehicle(vehicle);
      const result = await this.#repository.create(vehicle); this.#eventBus?.emit(Events.VEHICLE_CREATED, eventEnvelope(result.id, 'vehicles-service', result)); return result;
    })().finally(() => { this.#createPending = undefined; });
    return this.#createPending;
  }
  async updateVehicle(id, patch) {
    if (!id?.trim()) throw new TypeError('Vehicle id is required');
    if (patch?.id !== undefined && patch.id !== id) throw new TypeError('Vehicle id is immutable');
    const current = await this.#repository.getById(id); if (!current) throw new Error('Vehicle not found');
    const value = cleanInput(patch); if ('plate' in value) value.plate = normalizePlate(value.plate);
    const nextPlate = value.plate ?? current.plate; const nextActive = value.active ?? current.active;
    await this.#assertUniqueActivePlate(nextPlate, nextActive !== false, id);
    value.updatedAt = this.now(); const result = await this.#repository.update(id, value);
    this.#eventBus?.emit(Events.VEHICLE_UPDATED, eventEnvelope(id, 'vehicles-service', value)); return result;
  }
  setVehicleActive(id, active) { if (typeof active !== 'boolean') throw new TypeError('Vehicle active must be boolean'); return this.updateVehicle(id, { active }); }
  async removeVehicle(id) { const result = await this.#repository.remove(id); this.#eventBus?.emit(Events.VEHICLE_DELETED, eventEnvelope(id, 'vehicles-service')); return result; }
  subscribeVehicles(callback) { return this.realtime?.subscribeCollection?.('vehicles', callback) ?? null; }
}
