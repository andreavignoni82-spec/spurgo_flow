const clone = value => value === undefined ? undefined : structuredClone(value);
const text = value => value == null ? '' : String(value);

export const REPORT_FIELDS = Object.freeze([
  'relation', 'activities', 'anomaly', 'anomalies', 'materials', 'notes', 'photos',
  'operatorName', 'customerSigner', 'operatorSignature', 'customerSignature',
  'operatorSignTime', 'customerSignTime', 'generatedAt'
]);

// Keeps every unknown v6.1.21 field while providing stable internal names.
export function normalizeReport(source = {}, interventionId) {
  const value = clone(source) ?? {};
  const id = interventionId ?? value.interventionId;
  return {
    ...value,
    interventionId: id == null ? '' : String(id),
    relation: text(value.relation ?? value.report),
    activities: clone(value.activities ?? []),
    anomaly: text(value.anomaly),
    anomalies: clone(value.anomalies ?? (value.anomaly ? [value.anomaly] : [])),
    materials: clone(value.materials ?? []),
    notes: text(value.notes),
    photos: clone(value.photos ?? []),
    operatorSignature: clone(value.operatorSignature ?? ''),
    customerSignature: clone(value.customerSignature ?? value.signature ?? ''),
    customerSigner: text(value.customerSigner ?? value.signer),
    operatorName: text(value.operatorName),
    operatorSignTime: text(value.operatorSignTime),
    customerSignTime: text(value.customerSignTime),
    generatedAt: value.generatedAt ?? null
  };
}

export const createReport = (interventionId, source = {}) => normalizeReport(source, interventionId);
export const copyReport = report => normalizeReport(report, report?.interventionId);

export function persistedReport(report) {
  const value = clone(report) ?? {};
  delete value.interventionId;
  return value;
}
