export const DOMAIN_EVENTS = Object.freeze([
  'intervention:created', 'intervention:updated', 'intervention:deleted',
  'intervention:statusChanged', 'operator:created', 'operator:updated',
  'operator:statusChanged', 'operator:availabilityChanged', 'team:created', 'team:updated', 'team:deleted', 'client:created',
  'client:updated', 'client:deleted', 'client:interventionRequested',
  'vehicle:created', 'vehicle:updated', 'vehicle:deleted', 'report:updated', 'message:created',
  'auth:login', 'auth:logout', 'sync:online', 'sync:error'
]);

export class EventBus {
  #listeners = new Map();

  on(eventName, handler) {
    if (typeof handler !== 'function') throw new TypeError('handler must be a function');
    const listeners = this.#listeners.get(eventName) ?? new Set();
    listeners.add(handler);
    this.#listeners.set(eventName, listeners);
    return () => this.off(eventName, handler);
  }

  off(eventName, handler) {
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return false;
    const removed = listeners.delete(handler);
    if (!listeners.size) this.#listeners.delete(eventName);
    return removed;
  }

  emit(eventName, payload) {
    const errors = [];
    for (const handler of [...(this.#listeners.get(eventName) ?? [])]) {
      try { handler(payload); } catch (error) { errors.push(error); }
    }
    return errors;
  }
}

export const eventBus = new EventBus();
