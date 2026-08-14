import { SignaturePad } from '../../reports/signatures/signature-pad.js';
import { ReportPhotos } from '../../reports/photos/report-photos.js';

export class OperatorReport {
  #busy = false; #pads = []; #photos; #photoPromises = []; #photoInput;
  constructor({ reportsService, interventionsService, signal, onMessage = () => {} } = {}) {
    this.reports = reportsService; this.interventions = interventionsService; this.signal = signal; this.onMessage = onMessage;
  }
  get busy() { return this.#busy; }
  async load(interventionId) { if (!this.reports?.getReport) throw new Error('Rapportino temporaneamente non disponibile.'); return this.reports.getReport(interventionId); }
  async save(interventionId, report) {
    this.#available(); const saved = await this.reports.saveReport(interventionId, report); this.#active(); this.#photoPromises = []; if (this.#photoInput) this.#photoInput.value = ''; this.onMessage('Rapportino salvato'); return saved;
  }
  async complete(interventionId, report, completionData = {}) {
    if (this.#busy) return undefined;
    this.#busy = true;
    try {
      this.#available();
      try { await this.reports.saveReport(interventionId, report); this.#photoPromises = []; if (this.#photoInput) this.#photoInput.value = ''; }
      catch (error) { this.#active(); this.onMessage('Rapportino non salvato. Intervento non terminato.'); throw Object.assign(error, { stage: 'report' }); }
      this.#active();
      try { const completed = await this.interventions.completeIntervention(interventionId, completionData); this.#active(); this.onMessage('Intervento terminato'); return completed; }
      catch (error) { this.#active(); this.onMessage('Rapportino salvato, ma chiusura intervento non completata.'); throw Object.assign(error, { stage: 'completion' }); }
    } finally { this.#busy = false; }
  }
  mountEnhancements(container) {
    this.#photos = new ReportPhotos();
    this.#photoInput = container?.querySelector?.('[data-role="photos"]');
    this.#photoInput?.addEventListener('change', this.#onPhotos);
    for (const canvas of container?.querySelectorAll?.('[data-signature]') ?? []) {
      try { this.#pads.push({ type: canvas.dataset.signature, pad: new SignaturePad(canvas) }); }
      catch { canvas.replaceWith(Object.assign(document.createElement('p'), { textContent: 'Firma temporaneamente non disponibile.' })); }
    }
  }
  async collect(report = {}) {
    const signatures = {};
    for (const { type, pad } of this.#pads) if (!pad.isEmpty()) signatures[type === 'operator' ? 'operatorSignature' : 'customerSignature'] = pad.exportImage();
    const photos = await Promise.all(this.#photoPromises); this.#active();
    return { ...report, ...signatures, photos: [...(report.photos ?? []), ...photos] };
  }
  destroy() { this.#photoInput?.removeEventListener('change', this.#onPhotos); this.#photoInput = undefined; this.#pads.splice(0).forEach(({ pad }) => pad.destroy()); this.#photos?.destroy(); this.#photos = undefined; this.#photoPromises = []; }
  #onPhotos = event => { const selected = this.#photos.select(event.target.files); this.#photoPromises.push(...selected.map(photo => new Promise((resolve, reject) => { const reader = new FileReader(); reader.onload = () => resolve({ ...photo, data: reader.result, file: undefined }); reader.onerror = () => reject(reader.error); reader.readAsDataURL(photo.file); }))); };
  #available() { if (!this.reports?.saveReport) throw new Error('Rapportino temporaneamente non disponibile.'); }
  #active() { if (this.signal?.aborted) throw new DOMException('Operator feature unmounted', 'AbortError'); }
}
