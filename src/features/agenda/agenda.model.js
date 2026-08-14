import { layoutTimelineLanes, timelinePosition, timelineWidth } from './agenda.timeline.js';

export const RESOURCE_PALETTE = Object.freeze([
  { bg: '#eaf3fb', border: '#94b9d6', ink: '#204d70' },
  { bg: '#eaf6ee', border: '#91c2a1', ink: '#285b39' },
  { bg: '#fff3e5', border: '#dfb27c', ink: '#714a1f' },
  { bg: '#f2edfa', border: '#b5a1d2', ink: '#513d70' },
  { bg: '#e7f6f5', border: '#8fc6c2', ink: '#285d59' },
  { bg: '#fbecec', border: '#d8a0a0', ink: '#743737' },
  { bg: '#f5eee9', border: '#c7aa98', ink: '#62483a' },
  { bg: '#faedf4', border: '#d6a6bf', ink: '#703d57' },
  { bg: '#eef1f3', border: '#aeb9c0', ink: '#43515b' },
  { bg: '#f4f5e7', border: '#c4c68e', ink: '#5b5e2e' }
]);

export const todayKey = (now = new Date()) => {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export function resourceColor(resourceId) {
  const key = String(resourceId || 'unassigned');
  let hash = 0;
  for (let index = 0; index < key.length; index++) hash = ((hash << 5) - hash + key.charCodeAt(index)) | 0;
  return RESOURCE_PALETTE[Math.abs(hash) % RESOURCE_PALETTE.length];
}

export function resourceIdFor(intervention) {
  if (intervention?.teamId) return `team:${intervention.teamId}`;
  const operatorId = intervention?.assignedOperatorIds?.[0] ?? intervention?.operatorId;
  return operatorId ? `operator:${operatorId}` : 'unassigned';
}

export function sortByTime(interventions = []) {
  return [...interventions].sort((left, right) => String(left.startTime ?? left.time ?? '').localeCompare(String(right.startTime ?? right.time ?? '')));
}

export function groupByResource(interventions = []) {
  const grouped = new Map();
  for (const intervention of sortByTime(interventions)) {
    const id = resourceIdFor(intervention);
    grouped.set(id, [...(grouped.get(id) ?? []), intervention]);
  }
  return grouped;
}

export function computeTimelinePosition(time, options) { return timelinePosition(time, options); }
export function computeTimelineWidth(duration, left, options) { return timelineWidth(duration, left, options); }

const resourceRows = (operators, teams, interventions) => {
  const rows = [
    ...teams.map(team => ({ id: `team:${team.id}`, name: team.name || 'Squadra', meta: 'Squadra' })),
    ...operators.filter(operator => operator.active !== false).map(operator => ({
      id: `operator:${operator.id}`, name: operator.name || operator.displayName || operator.username || 'Operatore',
      meta: operator.mezzo || operator.role || operator.ruolo || 'Operatore'
    }))
  ];
  if (interventions.some(item => resourceIdFor(item) === 'unassigned')) rows.push({ id: 'unassigned', name: 'Da assegnare', meta: 'Interventi non assegnati' });
  return rows;
};

export function buildAgendaDayModel({ date = todayKey(), interventions = [], operators = [], teams = [] } = {}) {
  const visible = sortByTime(interventions.filter(item => item.date === date && item.status !== 'Annullato'));
  const grouped = groupByResource(visible);
  const resources = resourceRows(operators, teams, visible).map(resource => {
    const color = resourceColor(resource.id);
    const blocks = layoutTimelineLanes(grouped.get(resource.id) ?? []);
    return Object.freeze({ ...resource, color, blocks, laneCount: Math.max(1, ...blocks.map(block => block.lane + 1)) });
  });
  return Object.freeze({ date, resources, interventions: visible });
}

export function buildAgendaWeekModel({ date = todayKey(), interventions = [] } = {}) {
  const base = new Date(`${date}T12:00:00`);
  base.setDate(base.getDate() - ((base.getDay() + 6) % 7));
  const active = interventions.filter(item => item.status !== 'Annullato');
  const days = Array.from({ length: 7 }, (_, offset) => {
    const day = new Date(base); day.setDate(base.getDate() + offset);
    const key = todayKey(day);
    return Object.freeze({ date: key, interventions: sortByTime(active.filter(item => item.date === key)) });
  });
  return Object.freeze({ date, days });
}
