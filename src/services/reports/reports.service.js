import { normalizeReport, persistedReport } from '../../shared/models/report.js';
import { normalizeSignature } from '../../features/reports/signatures/signature.model.js';
import { normalizePhoto } from '../../features/reports/photos/report-photos.model.js';

export class ReportsService {
  constructor({ repository, eventBus } = {}) { this.repository = repository; this.eventBus = eventBus; }

  async getReport(interventionId) {
    this.#id(interventionId);
    return normalizeReport((await this.#repository().getByInterventionId(interventionId)) ?? {}, interventionId);
  }

  async saveReport(interventionId, reportData) {
    const id = this.#id(interventionId);
    const existed = await this.#repository().getByInterventionId(id);
    const report = normalizeReport(reportData, id);
    const saved = await this.#repository().save(id, persistedReport(report));
    this.#emit(existed == null ? 'report:created' : 'report:updated', id);
    return normalizeReport(saved, id);
  }

  async updateReport(interventionId, patch) {
    const id = this.#id(interventionId);
    const saved = await this.#repository().update(id, persistedReport({ ...patch }));
    this.#emit('report:updated', id);
    return normalizeReport(saved, id);
  }

  async attachSignature(interventionId, signerType, signature) {
    const id = this.#id(interventionId);
    const normalized = normalizeSignature(signature, signerType);
    if (!normalized.dataUrl) throw new Error('Firma non acquisita.');
    const operator = normalized.signerType === 'operator';
    const patch = operator
      ? { operatorSignature: normalized.dataUrl, operatorSignTime: normalized.signedAt }
      : { customerSignature: normalized.dataUrl, customerSignTime: normalized.signedAt };
    const saved = await this.#repository().update(id, patch);
    this.#emit('report:signatureUpdated', id);
    return normalizeReport(saved, id);
  }

  async attachPhoto(interventionId, photo) {
    const id = this.#id(interventionId);
    const report = await this.getReport(id);
    const saved = await this.#repository().update(id, { photos: [...report.photos, normalizePhoto(photo)] });
    this.#emit('report:photosUpdated', id);
    return normalizeReport(saved, id);
  }

  #repository() { if (!this.repository) throw new Error('ReportsRepository non disponibile'); return this.repository; }
  #id(value) { if (value == null || String(value).trim() === '') throw new Error('Intervento non valido'); return String(value); }
  #emit(name, interventionId) { this.eventBus?.emit(name, { interventionId }); }
}
