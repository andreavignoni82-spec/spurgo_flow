import { canOperatorAccessIntervention, operatorTeamIds, selectOperatorInterventions } from '../../shared/selectors/operator-interventions.js';

export { canOperatorAccessIntervention, operatorTeamIds, selectOperatorInterventions };

export const operatorTodayKey = (now = new Date()) => {
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
};

export function buildOperatorAgendaModel({ interventions = [], date = operatorTodayKey(), view = 'day' } = {}) {
  const start = new Date(`${date}T12:00:00`);
  if (view === 'week') start.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const dates = view === 'week'
    ? Array.from({ length: 7 }, (_, offset) => { const day = new Date(start); day.setDate(start.getDate() + offset); return operatorTodayKey(day); })
    : [date];
  const byDate = dates.map(key => ({
    date: key,
    interventions: interventions.filter(item => item.date === key && item.status !== 'Annullato')
      .sort((a, b) => String(a.startTime ?? a.time ?? '').localeCompare(String(b.startTime ?? b.time ?? '')))
  }));
  return Object.freeze({ date, view, days: byDate });
}
