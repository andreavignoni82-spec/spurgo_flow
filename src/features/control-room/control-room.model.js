import { buildTimelineRows } from './control-room.timeline.js';

const copy = value => typeof structuredClone === 'function' ? structuredClone(value) : JSON.parse(JSON.stringify(value));
const resourceName = (value, fallback) => value?.name || value?.nome || fallback;

export function buildResources(operators = [], teams = []) {
  return [
    ...teams.filter(team => team.active !== false).map(team => ({ ...copy(team), id: `team:${team.id}`, entityId: String(team.id), kind: 'team', name: resourceName(team, 'Squadra') })),
    ...operators.filter(operator => operator.active !== false).map(operator => ({ ...copy(operator), id: `op:${operator.id}`, entityId: String(operator.id), kind: 'operator', name: resourceName(operator, 'Operatore') })),
    { id: 'unassigned', kind: 'unassigned', name: 'Non assegnati', available: false }
  ];
}

export function buildResourceTimeline(resources = [], planningData = {}) {
  const rows = buildTimelineRows(planningData.schedules, { dayStartMinutes: planningData.config?.dayStartMinutes });
  return resources.map(resource => ({ resource: copy(resource), rows: rows[resource.id] || [] }));
}

export function buildResourceStatus(resources = [], planningData = {}) {
  return resources.map(resource => {
    const status = planningData.statuses?.[resource.id] || { severity: 'ok', availability: { state: 'LIBERO', minutes: planningData.nowMinutes || 0 } };
    return { resourceId: resource.id, state: status.availability.state, availableAt: Math.max(0, status.availability.minutes || 0), severity: status.severity };
  });
}

export function buildCriticalities(resources = [], planningData = {}) {
  const names = Object.fromEntries(resources.map(resource => [resource.id, resource.name]));
  return Object.entries(planningData.schedules || {}).flatMap(([resourceId, rows]) => rows
    .filter(row => ['warning', 'delay', 'critical'].includes(row.severity))
    .map(row => ({ interventionId: row.job.id, resourceId, resourceName: names[resourceId], severity: row.severity, delayMinutes: Math.max(0, row.delta), marginMinutes: Math.max(0, row.margin), overlap: Boolean(row.overlap) })))
    .sort((a, b) => ({ critical: 0, delay: 1, warning: 2 }[a.severity] - { critical: 0, delay: 1, warning: 2 }[b.severity]));
}

export function buildSuggestions(planningData = {}) {
  return (planningData.suggestions || []).map(item => ({
    interventionId: String(item.interventionId), urgent: Boolean(item.urgent),
    alternatives: (item.alternatives || []).map(candidate => ({ resourceId: candidate.resource.id, resourceName: candidate.resource.name, arrival: Math.max(0, candidate.arrival), travelMinutes: Math.max(0, candidate.travelMinutes), margin: candidate.margin, impacted: candidate.impacted?.map(row => row.job?.client || row.job?.clientName || row.job?.id) || [] }))
  }));
}

export function buildControlRoomModel({ date, interventions = [], operators = [], teams = [], vehicles = [], planningData = {}, degraded = false } = {}) {
  const resources = buildResources(operators, teams);
  return { date, interventions: copy(interventions), resources, vehicles: copy(vehicles), timeline: buildResourceTimeline(resources, planningData), statuses: buildResourceStatus(resources, planningData), criticalities: buildCriticalities(resources, planningData), suggestions: buildSuggestions(planningData), degraded };
}
