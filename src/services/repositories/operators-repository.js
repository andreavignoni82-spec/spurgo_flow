import { RepositoryContract } from './base-repository.js';
export class OperatorsRepository extends RepositoryContract {
  constructor(sources = {}) { super(sources); this.sources = sources; }
  #call(method, ...args) { const source = this.sources[method]; if (typeof source !== 'function') return this.notImplemented(method); return source(...args); }
  getById(id) { return this.#call('getById', id); }
  create(operator) { return this.#call('create', operator); }
  update(id, patch) { return this.#call('update', id, patch); }
  setActive(id, active) { return this.#call('setActive', id, Boolean(active)); }
}
