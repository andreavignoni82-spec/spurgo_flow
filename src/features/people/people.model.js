const text = value => String(value ?? '').trim();

export function normalizeOperator(source = {}) {
  return Object.freeze({ ...source, id: text(source.id), nome: text(source.nome), cognome: text(source.cognome), username: text(source.username), telefono: text(source.telefono), mezzo: text(source.mezzo), ruolo: text(source.ruolo) || 'Operatore', active: source.active !== false });
}

export function normalizeTeam(source = {}) {
  return Object.freeze({ ...source, id: text(source.id), name: text(source.name), vehicle: text(source.vehicle), operatorIds: Object.freeze([...new Set(Array.isArray(source.operatorIds) ? source.operatorIds.map(text).filter(Boolean) : [])]) });
}

export function createPeopleModel({ operators = [], teams = [] } = {}) {
  return Object.freeze({ operators: Object.freeze(operators.map(normalizeOperator)), teams: Object.freeze(teams.map(normalizeTeam)) });
}
