export function validateVehicleForm(vehicle = {}) {
  const errors = {}; if (!String(vehicle.plate ?? '').trim()) errors.plate = 'La targa è obbligatoria.'; return errors;
}
