const clone = value => value === undefined ? undefined : structuredClone(value);

// Canonical v7 names sit beside the original 6.1.21 fields. Unknown fields are
// deliberately retained: reports and the operator application still own some of them.
export const INTERVENTION_FIELDS = Object.freeze([
  'id', 'clientId', 'client', 'clientName', 'address', 'city', 'coordinates', 'lat', 'lng',
  'date', 'time', 'startTime', 'endTime', 'timeEnd', 'estimatedMinutes', 'timeMode',
  'preferredRange', 'preferredFrom', 'preferredTo', 'type', 'request', 'description',
  'notes', 'priority', 'status', 'operatorId', 'assignedOperatorIds', 'teamId', 'vehicleId',
  'billing', 'createdAt', 'updatedAt', 'startedAt', 'endedAt', 'actualStart', 'actualEnd',
  'closedAt', 'reportData', 'report', 'reportNo', 'transcript', 'activities', 'anomalies',
  'photos', 'gps', 'signer', 'signature', 'history', 'permanent', 'survey', 'resourceId'
]);

export function normalizeIntervention(source = {}) {
  const value = clone(source) ?? {};
  const assigned = Array.isArray(value.assignedOperatorIds)
    ? [...new Set(value.assignedOperatorIds.filter(Boolean).map(String))]
    : (value.operatorId ? [String(value.operatorId)] : []);
  return {
    ...value,
    id: value.id == null ? value.id : String(value.id),
    clientName: value.clientName ?? value.client ?? '',
    startTime: value.startTime ?? value.time ?? '',
    description: value.description ?? value.request ?? '',
    coordinates: value.coordinates ?? value.gps ?? ((value.lat != null || value.lng != null) ? { lat: value.lat, lng: value.lng } : null),
    actualStart: value.actualStart ?? value.startedAt ?? null,
    actualEnd: value.actualEnd ?? value.endedAt ?? value.closedAt ?? null,
    assignedOperatorIds: assigned,
    operatorId: value.operatorId ? String(value.operatorId) : (assigned[0] ?? ''),
    reportData: clone(value.reportData ?? null)
  };
}

export const toIntervention = normalizeIntervention;
export const copyIntervention = intervention => normalizeIntervention(intervention);
