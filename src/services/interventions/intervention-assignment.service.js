export class InterventionAssignmentService {
  operator(operatorId) { const id=operatorId ? String(operatorId) : ''; return { operatorId:id, assignedOperatorIds:id?[id]:[] }; }
  operators(operatorIds=[]) { const ids=[...new Set(operatorIds.filter(Boolean).map(String))]; return { assignedOperatorIds:ids, operatorId:ids[0]??'' }; }
  team(teamId) { return { teamId:teamId ? String(teamId) : '' }; }
  vehicle(vehicleId) { return { vehicleId:vehicleId ? String(vehicleId) : '' }; }
}
