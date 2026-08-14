const rows = value => Array.isArray(value) ? value : [];
const text = value => value == null ? '' : String(value);

const localDateKey = date => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const operatorName = operator =>
  text(operator?.name || [operator?.nome, operator?.cognome].filter(Boolean).join(' ') || operator?.username || '');

function assigneeLabel(intervention, operators, teams, vehicles) {
  const team = teams.find(item => item.id === intervention.teamId);
  const operator = operators.find(item => item.id === intervention.operatorId);
  const vehicle = vehicles.find(item => item.id === intervention.vehicleId);
  return [team?.name || team?.nome, operatorName(operator), vehicle?.name || vehicle?.nome || vehicle?.code]
    .filter(Boolean).join(' · ') || '—';
}

/** Build the read-only representation consumed by the Dashboard view. */
export function buildDashboardModel(data = {}) {
  const interventions = rows(data.interventions);
  const operators = rows(data.operators);
  const teams = rows(data.teams);
  const vehicles = rows(data.vehicles);
  const todayKey = localDateKey(data.now instanceof Date ? data.now : new Date());
  const today = interventions.filter(item => item?.date === todayKey && item?.status !== 'Annullato');
  const activeOperatorIds = new Set(operators.filter(item => item?.active !== false).map(item => item.id));

  const recent = interventions
    .filter(item => item?.status !== 'Annullato')
    .slice()
    .sort((a, b) => `${text(b?.date)}${text(b?.time)}`.localeCompare(`${text(a?.date)}${text(a?.time)}`))
    .slice(0, 8)
    .map(item => Object.freeze({
      id: text(item?.id), status: text(item?.status || '—'), client: text(item?.client || '—'),
      address: text(item?.address), time: text(item?.time || '—'),
      assignment: assigneeLabel(item, operators, teams, vehicles)
    }));

  return Object.freeze({
    title: 'Dashboard', subtitle: 'Centro operativo aziendale · dati reali',
    build: 'v7.0.0-alpha.2 · DASHBOARD MODULE',
    kpis: Object.freeze([
      Object.freeze({ label: 'Interventi oggi', value: today.length }),
      Object.freeze({ label: 'In corso', value: today.filter(item => item.status === 'In corso').length }),
      Object.freeze({ label: 'Completati', value: today.filter(item => item.status === 'Terminato').length }),
      Object.freeze({
        label: 'Squadre attive',
        value: teams.filter(team => rows(team?.operatorIds).some(id => activeOperatorIds.has(id))).length
      }),
      Object.freeze({ label: 'Da fatturare', value: interventions.filter(item => item?.billing === 'Da fatturare').length })
    ]),
    recent: Object.freeze(recent),
    resourceTotals: Object.freeze({ operators: operators.length, teams: teams.length, vehicles: vehicles.length }),
    unreadMessages: rows(data.messages).filter(message => message?.from === 'operator' && !message?.readByOffice).length
  });
}
