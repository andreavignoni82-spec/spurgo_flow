const ids = values => new Set((values ?? []).filter(value => value != null).map(String));

/** Domain-level access check used both by queries and before opening a job. */
export function canOperatorAccessIntervention(operatorId, intervention, teamIds = []) {
  if (operatorId == null || !intervention) return false;
  const operator = String(operatorId);
  if (String(intervention.operatorId ?? '') === operator) return true;
  if (ids(intervention.assignedOperatorIds).has(operator)) return true;
  const allowedTeams = ids(teamIds);
  if (intervention.teamId != null && allowedTeams.has(String(intervention.teamId))) return true;
  return [...ids(intervention.assignedTeamIds)].some(teamId => allowedTeams.has(teamId));
}

export function operatorTeamIds(operatorId, teams = []) {
  const operator = String(operatorId ?? '');
  return teams.filter(team => ids(team.operatorIds ?? team.memberIds).has(operator)).map(team => String(team.id));
}

export function selectOperatorInterventions(interventions, operatorId, teams = []) {
  const teamIds = operatorTeamIds(operatorId, teams);
  return (interventions ?? []).filter(item => canOperatorAccessIntervention(operatorId, item, teamIds));
}
