import { RepositoryContract } from './base-repository.js';
export class TeamsRepository extends RepositoryContract {
  constructor(sources = {}) { super(sources); this.sources = sources; }
  #call(method, ...args) { const source = this.sources[method]; if (typeof source !== 'function') return this.notImplemented(method); return source(...args); }
  getById(id) { return this.#call('getById', id); }
  create(team) { return this.#call('create', team); }
  update(id, patch) { return this.#call('update', id, patch); }
  remove(id) { return this.#call('remove', id); }
}
