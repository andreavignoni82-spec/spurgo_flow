import { RepositoryContract } from './base-repository.js';

const reportPayload = value => {
  const copy = value && typeof value === 'object' ? structuredClone(value) : {};
  delete copy.interventionId;
  return copy;
};

// reportData remains embedded in interventions/{id}. This adapter is the only
// persistence port exposed to the Reports domain.
export class ReportsRepository extends RepositoryContract {
  constructor({ interventionsRepository, getByInterventionId, save, update } = {}) {
    super();
    this.interventions = interventionsRepository;
    this.sources = { getByInterventionId, save, update };
  }

  async getByInterventionId(id) {
    const key = String(id);
    if (this.sources.getByInterventionId) return this.copy(await this.sources.getByInterventionId(key));
    const intervention = await this.#intervention(key);
    return intervention?.reportData == null ? undefined : this.copy(intervention.reportData);
  }

  async save(interventionId, reportData) {
    const key = String(interventionId);
    const payload = reportPayload(reportData);
    if (this.sources.save) return this.copy(await this.sources.save(key, payload));
    await this.#requireInterventions().update(key, { reportData: payload });
    return this.copy(payload);
  }

  async update(interventionId, patch) {
    const key = String(interventionId);
    const cleanPatch = reportPayload(patch);
    if (this.sources.update) return this.copy(await this.sources.update(key, cleanPatch));
    const current = (await this.getByInterventionId(key)) ?? {};
    const merged = { ...current, ...cleanPatch };
    await this.#requireInterventions().update(key, { reportData: merged });
    return this.copy(merged);
  }

  getById(id) { return this.getByInterventionId(id); }
  async #intervention(id) { return this.#requireInterventions().getById(id); }
  #requireInterventions() {
    if (!this.interventions) throw new Error('InterventionsRepository non disponibile');
    return this.interventions;
  }
}
