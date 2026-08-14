export class AppState {
  #state;
  #subscribers = new Set();

  constructor(initialState = {}) { this.#state = Object.freeze({ ...initialState }); }
  get(key) { return key === undefined ? this.#state : this.#state[key]; }
  set(patch) {
    if (!patch || typeof patch !== 'object') throw new TypeError('state patch must be an object');
    this.#state = Object.freeze({ ...this.#state, ...patch });
    for (const subscriber of [...this.#subscribers]) subscriber(this.#state);
    return this.#state;
  }
  subscribe(subscriber) {
    this.#subscribers.add(subscriber);
    return () => this.#subscribers.delete(subscriber);
  }
}
