const FIELDS = Object.freeze(['id', 'name', 'code', 'type', 'plate', 'capacity', 'status', 'hours', 'nextMaintenance']);
const text = value => String(value ?? '').trim();

export function normalizeVehicle(source = {}) {
  const vehicle = {};
  for (const field of FIELDS) vehicle[field] = field === 'hours' ? Number(source[field] || 0) : text(source[field]);
  return Object.freeze(vehicle);
}

export function filterVehicles(vehicles, query = '') {
  const needle = text(query).toLocaleLowerCase('it');
  const rows = (Array.isArray(vehicles) ? vehicles : []).map(normalizeVehicle);
  if (!needle) return rows;
  return rows.filter(vehicle => FIELDS.some(field => String(vehicle[field]).toLocaleLowerCase('it').includes(needle)));
}

export function sortVehicles(vehicles) {
  return [...(Array.isArray(vehicles) ? vehicles : [])].sort((a, b) =>
    text(a?.name).localeCompare(text(b?.name), 'it', { sensitivity: 'base' }));
}

export function validateVehicle(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return { valid: false, errors: { form: 'Dati mezzo non validi.' } };
  const vehicle = normalizeVehicle(source); const errors = {};
  if (!vehicle.name) errors.name = 'Inserisci il nome del mezzo.';
  if (!Number.isFinite(vehicle.hours) || vehicle.hours < 0) errors.hours = 'Ore/km non validi.';
  if (source.id != null && !vehicle.id) errors.id = 'ID mezzo non valido.';
  return { valid: !Object.keys(errors).length, errors, vehicle };
}
