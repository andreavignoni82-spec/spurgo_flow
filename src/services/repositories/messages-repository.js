import { RepositoryContract } from './base-repository.js';
export class MessagesRepository extends RepositoryContract {
  constructor(sources = {}) { super(sources); this.sources = sources; }
  #call(method, ...args) { const source = this.sources[method]; if (typeof source !== 'function') return this.notImplemented(method); return source(...args); }
  getById(id) { return this.#call('getById', id); }
  create(message) { return this.#call('create', message); }
  update(id, patch) { return this.#call('update', id, patch); }
  markRead(id, reader = 'office') { return this.#call('markRead', id, reader); }
}
