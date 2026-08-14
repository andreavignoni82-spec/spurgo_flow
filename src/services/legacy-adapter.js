// The compatibility seam is intentionally the only v7 module allowed to inspect v6 globals.
const copy = value => {
  if (typeof structuredClone === 'function') return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export class LegacyAdapter {
  constructor(globalScope = globalThis) { this.globals = globalScope; }

  #legacySnapshot() {
    const exposedState = this.globals.SFState;
    return typeof exposedState?.snapshot === 'function' ? exposedState.snapshot() : {};
  }

  #collection(name, legacyName) {
    const snapshot = this.#legacySnapshot();
    const rows = snapshot[name] ?? this.globals[legacyName] ?? [];
    return copy(Array.isArray(rows) ? rows : []);
  }

  interventions() { return this.#collection('interventions', 'sfOfficeInterventions'); }
  interventionById(id) { return this.interventions().find(row => String(row.id) === String(id)); }
  createIntervention(row) { return this.globals.SFState?.createIntervention(row); }
  updateIntervention(id, patch) { return this.globals.SFState?.updateIntervention(id, patch); }
  removeIntervention(id) { return this.globals.SFState?.removeIntervention(id); }
  operators() { return this.#collection('operators', 'sfOperators'); }
  operatorById(id) { return this.operators().find(operator => String(operator.id) === String(id)); }
  createOperator(operator) { return this.globals.SFState?.createOperator(operator); }
  updateOperator(id, patch) { return this.globals.SFState?.updateOperator(id, patch); }
  setOperatorActive(id, active) { return this.globals.SFState?.setOperatorActive(id, active); }
  teams() { return this.#collection('teams', 'sfTeams'); }
  teamById(id) { return this.teams().find(team => String(team.id) === String(id)); }
  createTeam(team) { return this.globals.SFState?.createTeam(team); }
  updateTeam(id, patch) { return this.globals.SFState?.updateTeam(id, patch); }
  removeTeam(id) { return this.globals.SFState?.removeTeam(id); }
  vehicles() { return this.#collection('vehicles', 'sfVehicles'); }
  vehicleById(id) { return this.vehicles().find(vehicle => String(vehicle.id) === String(id)); }
  createVehicle(vehicle) { return this.globals.SFState?.createVehicle(vehicle); }
  updateVehicle(id, patch) { return this.globals.SFState?.updateVehicle(id, patch); }
  removeVehicle(id) { return this.globals.SFState?.removeVehicle(id); }
  messages() { return this.#collection('messages', 'sfMessages'); }
  clients() { return this.#collection('clients', 'sfClients'); }
  clientById(id) { return this.clients().find(client => String(client.id) === String(id)); }
  createClient(client) { return this.globals.SFState?.createClient(client); }
  updateClient(id, patch) { return this.globals.SFState?.updateClient(id, patch); }
  removeClient(id) { return this.globals.SFState?.removeClient(id); }
  openInterventionForClient(id) { return this.globals.SFState?.openInterventionForClient(id); }
  snapshot() {
    return {
      interventions: this.interventions(), operators: this.operators(),
      teams: this.teams(), clients: this.clients(), vehicles: this.vehicles(), messages: this.messages()
    };
  }
}
