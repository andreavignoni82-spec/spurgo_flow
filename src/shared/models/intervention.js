export const INTERVENTION_FIELDS = Object.freeze([
  'id', 'clientId', 'client', 'address', 'date', 'time', 'estimatedMinutes',
  'status', 'priority', 'teamId', 'operatorId', 'assignedOperatorIds',
  'vehicleId', 'notes'
]);

export function toIntervention(source = {}) {
  return Object.fromEntries(INTERVENTION_FIELDS.map(field => [field,
    field === 'assignedOperatorIds' ? [...(source[field] ?? [])] : source[field]
  ]));
}
