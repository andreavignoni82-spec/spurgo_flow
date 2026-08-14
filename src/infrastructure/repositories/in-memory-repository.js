import { RepositoryContract } from '../../services/repository-contract.js';
export class InMemoryRepository extends RepositoryContract {
  #records = new Map();
  async getById(id) { return this.#records.get(id); }
  async list() { return [...this.#records.values()]; }
  async save(entity) { this.#records.set(entity.id, structuredClone(entity)); return entity; }
  async remove(id) { return this.#records.delete(id); }
}
