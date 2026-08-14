import { RepositoryContract } from './base-repository.js';
export class VehiclesRepository extends RepositoryContract {
  getById() { return this.notImplemented('getById'); }
  update() { return this.notImplemented('update'); }
}
