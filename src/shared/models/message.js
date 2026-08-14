const string = value => value == null ? '' : String(value);

/** Normalizes v6.1.21 and conceptual v7 fields without discarding the persisted DTO. */
export function toMessage(record = {}) {
  const from = record.from === 'operator' ? 'operator' : 'office';
  const recipientType = string(record.recipientType || (record.teamId ? 'team' : 'operator'));
  const recipientId = string(record.recipientId || record.teamId || record.operatorId);
  const read = from === 'operator' ? record.readByOffice : record.readByOperator;
  return {
    ...record,
    id: string(record.id),
    senderId: string(record.senderId || (from === 'operator' ? record.operatorId : 'office')),
    recipientType,
    recipientId,
    text: string(record.text),
    createdAt: string(record.createdAt || record.ts),
    readAt: record.readAt ?? (read ? string(record.updatedAt || record.ts) : null),
    status: string(record.status || (read ? 'read' : 'unread'))
  };
}

/** Creates the unchanged office-to-operator v6.1.21 persistence shape. */
export function newOfficeMessage({ id, operatorId, text, createdAt }) {
  return { id: string(id), operatorId: string(operatorId), from: 'office', text: string(text), ts: string(createdAt), readByOperator: false, readByOffice: true };
}
