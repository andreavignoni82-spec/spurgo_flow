export class EventBus {
  #listeners = new Map();
  #onSubscriberError;
  constructor({ onSubscriberError = () => {} } = {}) { this.#onSubscriberError = onSubscriberError; }
  on(type, subscriber) {
    const listeners = this.#listeners.get(type) ?? new Set();
    listeners.add(subscriber); this.#listeners.set(type, listeners);
    return () => this.off(type, subscriber);
  }
  off(type, subscriber) {
    const listeners = this.#listeners.get(type);
    if (!listeners) return false;
    const removed = listeners.delete(subscriber);
    if (listeners.size === 0) this.#listeners.delete(type);
    return removed;
  }
  emit(type, payload) {
    for (const subscriber of [...(this.#listeners.get(type) ?? [])]) {
      try {
        const outcome = subscriber(payload);
        if (outcome && typeof outcome.then === 'function') outcome.catch((error) => this.#onSubscriberError(error, type));
      } catch (error) { this.#onSubscriberError(error, type); }
    }
  }
}
