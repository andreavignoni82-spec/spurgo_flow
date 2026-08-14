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
  operators() { return this.#collection('operators', 'sfOperators'); }
  teams() { return this.#collection('teams', 'sfTeams'); }
  vehicles() { return this.#collection('vehicles', 'sfVehicles'); }
  messages() { return this.#collection('messages', 'sfMessages'); }
  snapshot() {
    return {
      interventions: this.interventions(), operators: this.operators(),
      teams: this.teams(), vehicles: this.vehicles(), messages: this.messages()
    };
  }
}
