import { RepositoryContract } from './base-repository.js';
export class ClientsRepository extends RepositoryContract {
  constructor({ list, getById, create, update, remove } = {}) {
    super({ list });
    this.sources = { getById, create, update, remove };
  }
  getById(id) { return this.#call('getById', id); }
  create(client) { return this.#call('create', this.copy(client)); }
  update(id, patch) { return this.#call('update', id, this.copy(patch)); }
  remove(id) { return this.#call('remove', id); }

  #call(method, ...args) {
    const source = this.sources[method];
    if (typeof source !== 'function') return this.notImplemented(method);
    const result = source(...args);
    return result instanceof Promise ? result.then(value => this.copy(value)) : this.copy(result);
  }
}
