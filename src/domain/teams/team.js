import { assertValid, validEmail, validId, validTimestamp } from '../shared/validators.js';
import { clean, clone, text } from '../shared/utils.js';
export function normalizeTeam(input) {
  const value = clean(clone(input)); for (const key of Object.keys(value)) if (typeof value[key] === 'string') value[key] = text(value[key]);
  if ('operatorIds' in value) value.operatorIds = [...(value.operatorIds ?? [])];
  return value;
}
export function validateTeam(value) { const errors=[]; if (!validId(value.id)) errors.push('Team.id is required'); if (!value.name) errors.push('Team.name is required'); if (!Array.isArray(value.operatorIds) || !value.operatorIds.every(validId)) errors.push('Team.operatorIds must contain IDs'); for (const key of ['createdAt','updatedAt']) if (value[key] && !validTimestamp(value[key])) errors.push(`Team.${key} is invalid`); assertValid(errors); return true; }
export const cloneTeam = clone;
export const TeamIdentity = Object.freeze({ field: 'id', immutable: true });
