import { RepositoryContract } from './base-repository.js';
export class InterventionsRepository extends RepositoryContract {
  list() { return this.notImplemented('list'); }
  getById() { return this.notImplemented('getById'); }
  listByDate() { return this.notImplemented('listByDate'); }
  create() { return this.notImplemented('create'); }
  update() { return this.notImplemented('update'); }
  delete() { return this.notImplemented('delete'); }
}
