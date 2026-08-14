import { RepositoryContract } from './base-repository.js';
import { normalizeIntervention } from '../../shared/models/intervention.js';

export class InterventionsRepository extends RepositoryContract {
  constructor({ list, getById, create, update, remove } = {}) {
    super({ list }); this.sources = { getById, create, update, remove };
  }
  list() { const rows=super.list(); return rows instanceof Promise ? rows.then(value=>value.map(normalizeIntervention)) : rows.map(normalizeIntervention); }
  async getById(id) {
    const value = this.sources.getById ? await this.sources.getById(id) : (await this.list()).find(row => row.id === String(id));
    return value == null ? undefined : normalizeIntervention(value);
  }
  async create(record) { return normalizeIntervention(await this.#call('create', this.copy(record))); }
  async update(id, patch) {
    if ('id' in patch && String(patch.id) !== String(id)) throw new Error('Intervention identity is immutable');
    const saved = await this.#call('update', id, this.copy(patch));
    return normalizeIntervention(saved);
  }
  async remove(id) { return this.copy(await this.#call('remove', id)); }
  delete(id) { return this.remove(id); }
  async queryByDate(date) { return (await this.list()).filter(row => row.date === date); }
  listByDate(date) { if (typeof this.listSource !== 'function') return this.notImplemented('listByDate'); return this.queryByDate(date); }
  async queryByOperator(id) { const key=String(id); return (await this.list()).filter(row => row.operatorId === key || row.assignedOperatorIds.includes(key)); }
  async queryByTeam(id) { return (await this.list()).filter(row => row.teamId === String(id)); }
  async #call(method, ...args) {
    const source = this.sources[method]; if (typeof source !== 'function') return this.notImplemented(method);
    return this.copy(await source(...args));
  }
}
