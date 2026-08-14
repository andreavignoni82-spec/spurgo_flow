import { normalizeReport } from '../../shared/models/report.js';

const label = value => value == null || value === '' ? '—' : String(value);
export class ReportPreviewService {
  createViewModel({ intervention = {}, report = {}, client, operator, team } = {}) {
    const data = normalizeReport(report, intervention.id ?? report.interventionId);
    return Object.freeze({
      interventionId: data.interventionId,
      reportNo: label(intervention.reportNo ?? intervention.id),
      client: label(client?.name ?? client?.businessName ?? intervention.clientName ?? intervention.client),
      address: label(intervention.address),
      date: label(intervention.date),
      times: label([intervention.startTime ?? intervention.time, intervention.endTime ?? intervention.timeEnd].filter(Boolean).join(' – ')),
      request: label(intervention.description ?? intervention.request),
      operator: label(data.operatorName || operator?.name || operator?.displayName),
      team: label(team?.name), relation: data.relation, activities: data.activities,
      anomaly: data.anomaly, anomalies: data.anomalies, materials: data.materials,
      notes: data.notes, photos: data.photos,
      customerSigner: data.customerSigner,
      operatorSignature: data.operatorSignature, customerSignature: data.customerSignature,
      operatorSignTime: data.operatorSignTime, customerSignTime: data.customerSignTime
    });
  }
  build(input) { return this.createViewModel(input); }
}
