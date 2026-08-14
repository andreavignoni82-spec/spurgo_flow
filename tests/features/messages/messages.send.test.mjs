import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { MessagesFeature } from '../../../src/features/messages/messages.feature.js';

const tick = () => new Promise(resolve => setTimeout(resolve, 0));
class Element {
  listeners = {};
  constructor(dataset = {}) { this.dataset = dataset; }
  addEventListener(name, handler) { this.listeners[name] = handler; }
  querySelector() { return this.textarea; }
  scrollTo() {}
  fire(name, event = {}) { this.listeners[name]?.({ preventDefault() {}, target: this, ...event }); }
}
class Container {
  html = ''; recipient = new Element({ recipientId: 'op1' }); read = new Element(); list = new Element(); form = new Element(); textarea = new Element();
  constructor() { this.form.textarea = this.textarea; }
  set innerHTML(value) { this.html = value; }
  get innerHTML() { return this.html; }
  querySelectorAll(selector) { return selector === '[data-recipient-id]' ? [this.recipient] : []; }
  querySelector(selector) { return ({ '[data-action="read"]': this.read, '.sf-messages-form': this.form, '.sf-messages-list': this.list })[selector]; }
}
const make = create => {
  const bus = new EventBus(), events = []; bus.on('message:created', payload => events.push(payload));
  return { bus, events, context: { eventBus: bus, repositories: { messages: { list: async () => [], create, markRead: async () => ({}) }, operators: { list: async () => [{ id: 'op1', nome: 'Ada', active: true }] }, teams: { list: async () => [] } } } };
};

let creates = 0;
const success = make(async message => { creates++; await tick(); return message; });
const feature = new MessagesFeature(), container = new Container(); await feature.mount(container, success.context);
container.recipient.fire('click'); container.textarea.fire('input', { target: { value: 'Pronto' } }); container.form.fire('submit'); container.form.fire('submit'); await tick(); await tick();
assert.equal(creates, 1, 'rapid double submit persists exactly once'); assert.equal(success.events.length, 1); assert.doesNotMatch(container.innerHTML, />Pronto<\/textarea>/, 'successful save clears draft'); feature.unmount();

const failure = make(async () => { throw new Error('offline'); });
const failed = new MessagesFeature(), failedContainer = new Container(); await failed.mount(failedContainer, failure.context);
failedContainer.recipient.fire('click'); failedContainer.textarea.fire('input', { target: { value: 'Conservami' } }); failedContainer.form.fire('submit'); await tick();
assert.equal(failure.events.length, 0); assert.match(failedContainer.innerHTML, />Conservami<\/textarea>/, 'failed save keeps draft'); assert.match(failedContainer.innerHTML, /Messaggio non inviato: offline/); failed.unmount();
console.log('Messages successful/failed send, event ordering, retained draft and rapid double-submit passed');
