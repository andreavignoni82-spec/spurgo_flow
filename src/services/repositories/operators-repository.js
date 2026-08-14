import { RepositoryContract } from './base-repository.js';
export class OperatorsRepository extends RepositoryContract {
  list() { return this.notImplemented('list'); }
  getById() { return this.notImplemented('getById'); }
  create() { return this.notImplemented('create'); }
  update() { return this.notImplemented('update'); }
}
