import { RepositoryContract } from './base-repository.js';
export class ReportsRepository extends RepositoryContract {
  list() { return this.notImplemented('list'); }
  getById() { return this.notImplemented('getById'); }
  update() { return this.notImplemented('update'); }
}
