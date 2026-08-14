import { assertValid, validEmail, validId, validTimestamp } from '../shared/validators.js';
import { clean, clone, text } from '../shared/utils.js';
export function normalizeOperator(input) {
  const value = clean(clone(input)); for (const key of Object.keys(value)) if (typeof value[key] === 'string') value[key] = text(value[key]);
  return value;
}
export function validateOperator(value) { const errors=[]; if (!validId(value.id)) errors.push('Operator.id is required'); if (!value.username) errors.push('Operator.username is required'); if (!value.name) errors.push('Operator.name is required'); if ('password' in value) errors.push('Operator.password is forbidden'); if (value.cloudEmail && !validEmail(value.cloudEmail)) errors.push('Operator.cloudEmail is invalid'); for (const key of ['createdAt','updatedAt']) if (value[key] && !validTimestamp(value[key])) errors.push(`Operator.${key} is invalid`); assertValid(errors); return true; }
export const cloneOperator = clone;
export const OperatorIdentity = Object.freeze({ field: 'id', immutable: true });
