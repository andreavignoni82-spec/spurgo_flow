import assert from 'node:assert/strict';
import { filterMessages, groupMessages, normalizeMessage, sortMessages } from '../../../src/features/messages/messages.model.js';

assert.deepEqual(sortMessages([]), []);
const operatorUnread = normalizeMessage({ id: 'm2', operatorId: 'op1', from: 'office', text: 'B', ts: '2026-08-14T10:00:00Z', readByOperator: false, legacy: 42 });
assert.equal(operatorUnread.recipientType, 'operator'); assert.equal(operatorUnread.recipientId, 'op1'); assert.equal(operatorUnread.status, 'unread'); assert.equal(operatorUnread.legacy, 42);
const operatorRead = normalizeMessage({ id: 'm1', operatorId: 'op1', from: 'office', text: 'A', ts: '2026-08-14T09:00:00Z', readByOperator: true });
assert.equal(operatorRead.status, 'read'); assert.ok(operatorRead.readAt);
const team = normalizeMessage({ id: 'm3', teamId: 'team1', recipientType: 'team', text: 'Team', createdAt: '2026-08-14T11:00:00Z' });
assert.equal(team.recipientId, 'team1'); assert.equal(team.recipientType, 'team');
assert.deepEqual(sortMessages([operatorUnread, operatorRead]).map(message => message.id), ['m1', 'm2']);
assert.deepEqual(filterMessages([team, operatorUnread], { recipientType: 'team', recipientId: 'team1' }).map(message => message.id), ['m3']);
assert.deepEqual(Object.keys(groupMessages([team, operatorUnread])).sort(), ['operator:op1', 'team:team1']);
const missing = normalizeMessage({ id: 'legacy' }); assert.equal(missing.text, ''); assert.equal(missing.createdAt, '');
console.log('Messages model empty, identity, sorting, recipients, read state and legacy gaps passed');
