import { toMessage } from '../../shared/models/message.js';

export const normalizeMessage = message => toMessage(message);
export const sortMessages = (messages = []) => [...messages].map(normalizeMessage).sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
export function filterMessages(messages = [], { recipientType, recipientId, status } = {}) {
  return sortMessages(messages).filter(message => (!recipientType || message.recipientType === recipientType) && (!recipientId || message.recipientId === String(recipientId)) && (!status || message.status === status));
}
export function groupMessages(messages = []) {
  return sortMessages(messages).reduce((groups, message) => {
    const key = `${message.recipientType}:${message.recipientId}`;
    (groups[key] ||= []).push(message);
    return groups;
  }, {});
}
