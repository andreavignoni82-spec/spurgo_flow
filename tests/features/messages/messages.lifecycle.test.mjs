import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { MessagesFeature } from '../../../src/features/messages/messages.feature.js';

const intervals = new Set(); let next = 0;
const nativeSet = globalThis.setInterval, nativeClear = globalThis.clearInterval;
globalThis.setInterval = callback => { const token = ++next; intervals.add(token); return token; };
globalThis.clearInterval = token => intervals.delete(token);
const emptyElement = { addEventListener() {}, scrollTo() {} };
const container = { innerHTML: '', querySelectorAll: () => [], querySelector: () => emptyElement };
const context = { eventBus: new EventBus(), repositories: { messages: { list: async () => [] }, operators: { list: async () => [] }, teams: { list: async () => [] } } };
try {
  const feature = new MessagesFeature();
  for (let count = 0; count < 10; count++) { await feature.mount(container, context); feature.unmount(); }
  assert.equal(intervals.size, 0, 'all fallback intervals are cleared');
  const isolated = new MessagesFeature(); await isolated.mount(container, context); context.eventBus.emit('message:created', { id: 'remote' }); await Promise.resolve(); isolated.unmount();
  assert.equal(intervals.size, 0);
} finally { globalThis.setInterval = nativeSet; globalThis.clearInterval = nativeClear; }
console.log('Messages repeated lifecycle and isolated realtime refresh passed');
