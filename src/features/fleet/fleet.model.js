import { cloneVehicle, normalizeVehiclePlate } from '../../domain/vehicles/vehicle.js';

export const normalizePlate = normalizeVehiclePlate;
export const safeCloneVehicle = vehicle => cloneVehicle(vehicle);
export function searchVehicles(vehicles, query = '') {
  const term = query.trim().toLocaleLowerCase('it'); if (!term) return vehicles.map(safeCloneVehicle);
  return vehicles.filter(vehicle => ['plate', 'name', 'type', 'notes'].some(key => String(vehicle[key] ?? '').toLocaleLowerCase('it').includes(term))).map(safeCloneVehicle);
}
export function sortVehicles(vehicles) {
  return vehicles.map(safeCloneVehicle).sort((a, b) => Number(b.active !== false) - Number(a.active !== false) || String(a.plate ?? '').localeCompare(String(b.plate ?? ''), 'it', { sensitivity: 'base' }));
}
export const selectVisibleVehicles = (vehicles, query) => sortVehicles(searchVehicles(vehicles, query));
export const countVehicleStates = vehicles => ({ total: vehicles.length, active: vehicles.filter(item => item.active !== false).length, inactive: vehicles.filter(item => item.active === false).length });
