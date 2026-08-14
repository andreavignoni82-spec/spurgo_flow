import { RepositoryContract } from './base-repository.js';
export class MessagesRepository extends RepositoryContract {
  list() { return this.notImplemented('list'); }
  create() { return this.notImplemented('create'); }
  update() { return this.notImplemented('update'); }
}
