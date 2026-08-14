import { assertValid, validEmail, validId, validTimestamp } from '../shared/validators.js';
import { clean, clone, text } from '../shared/utils.js';
export function normalizeClient(input) {
  const value = clean(clone(input)); for (const key of Object.keys(value)) if (typeof value[key] === 'string') value[key] = text(value[key]);
  return value;
}
export function validateClient(value) { const errors=[]; if (!validId(value.id)) errors.push('Client.id is required'); if (!value.name) errors.push('Client.name is required'); if (value.email && !validEmail(value.email)) errors.push('Client.email is invalid'); for (const key of ['createdAt','updatedAt']) if (value[key] && !validTimestamp(value[key])) errors.push(`Client.${key} is invalid`); assertValid(errors); return true; }
export const cloneClient = clone;
export const ClientIdentity = Object.freeze({ field: 'id', immutable: true });
