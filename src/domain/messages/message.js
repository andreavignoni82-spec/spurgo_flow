import { assertValid, validEmail, validId, validTimestamp } from '../shared/validators.js';
import { clean, clone, text } from '../shared/utils.js';
export function normalizeMessage(input) {
  const value = clean(clone(input)); for (const key of Object.keys(value)) if (typeof value[key] === 'string') value[key] = text(value[key]);
  return value;
}
export function validateMessage(value) { const errors=[]; for (const key of ['id','senderId','senderType','recipientId','recipientType']) if (!validId(value[key])) errors.push(`Message.${key} is required`); if (!value.text) errors.push('Message.text is required'); for (const key of ['createdAt','updatedAt']) if (value[key] && !validTimestamp(value[key])) errors.push(`Message.${key} is invalid`); assertValid(errors); return true; }
export const cloneMessage = clone;
export const MessageIdentity = Object.freeze({ field: 'id', immutable: true });
