const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
export const validId = (value) => typeof value === 'string' && value.trim().length > 0;
export const validDate = (value) => typeof value === 'string' && DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));
export const validTime = (value) => typeof value === 'string' && TIME.test(value);
export const validCoordinates = (value) => value != null && Number.isFinite(value.latitude) && value.latitude >= -90 && value.latitude <= 90 && Number.isFinite(value.longitude) && value.longitude >= -180 && value.longitude <= 180;
export const validEmail = (value) => typeof value === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
export const validDuration = (value) => Number.isInteger(value) && value > 0;
export const validStatus = (value, statuses) => Object.values(statuses).includes(value);
export const validTimestamp = (value) => typeof value === 'string' && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString() === value;
export function assertValid(errors) { if (errors.length) throw new TypeError(errors.join('; ')); }
