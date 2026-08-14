// The compatibility seam is intentionally the only v7 module allowed to inspect v6 globals.
export class LegacyAdapter {
  constructor(globalScope = globalThis) { this.globals = globalScope; }
  interventions() { return this.globals.sfOfficeInterventions ?? []; }
  operators() { return this.globals.sfOperators ?? []; }
  teams() { return this.globals.sfTeams ?? []; }
  snapshot() {
    return { interventions: this.interventions(), operators: this.operators(), teams: this.teams() };
  }
}
