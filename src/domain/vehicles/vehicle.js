import { assertValid, validEmail, validId, validTimestamp } from '../shared/validators.js';
import { clean, clone, text } from '../shared/utils.js';
export const normalizeVehiclePlate = plate => String(plate ?? '').trim().toUpperCase();
export function normalizeVehicle(input) {
  const value = clean(clone(input)); for (const key of Object.keys(value)) if (typeof value[key] === 'string') value[key] = text(value[key]);
  return value;
}
export function validateVehicle(value) { const errors=[]; if (!validId(value.id)) errors.push('Vehicle.id is required'); if (!value.plate) errors.push('Vehicle.plate is required'); for (const key of ['createdAt','updatedAt']) if (value[key] && !validTimestamp(value[key])) errors.push(`Vehicle.${key} is invalid`); assertValid(errors); return true; }
export const cloneVehicle = clone;
export const VehicleIdentity = Object.freeze({ field: 'id', immutable: true });
