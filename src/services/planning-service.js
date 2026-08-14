export class PlanningService {
  constructor(engine = globalThis.SFPlanning) { this.engine = engine; }

  get config() { return this.#required().CONFIG; }

  buildDay({ interventions = [], resources = [], nowMinutes = 0 } = {}) {
    const engine = this.#required();
    const schedules = Object.fromEntries(resources.map(resource => [resource.id, engine.buildSchedule(
      interventions.filter(intervention => this.resourceId(intervention) === resource.id), { nowMinutes }
    )]));
    return { schedules, nowMinutes, config: engine.CONFIG };
  }

  resourceId(intervention) {
    if (intervention?.teamId) return `team:${intervention.teamId}`;
    const operatorId = intervention?.assignedOperatorIds?.[0] || intervention?.operatorId;
    return operatorId ? `op:${operatorId}` : 'unassigned';
  }

  classify(schedule, nowMinutes = 0) {
    const engine = this.#required();
    const availability = engine.resourceAvailability(schedule, nowMinutes);
    const worst = schedule.reduce((result, row) => {
      const rank = { ok: 0, warning: 1, delay: 2, critical: 3 };
      return rank[row.severity] > rank[result] ? row.severity : result;
    }, 'ok');
    return { availability, severity: worst };
  }

  alternatives({ intervention, resources, schedules, nowMinutes = 0, limit = 3 }) {
    return this.#required().findResourceAlternatives(
      resources.filter(resource => resource.id !== this.resourceId(intervention) && resource.id !== 'unassigned'),
      intervention, schedules, { nowMinutes, limit }
    );
  }

  #required() {
    if (!this.engine?.buildSchedule || !this.engine?.resourceAvailability || !this.engine?.findResourceAlternatives) {
      throw new Error('Planning unavailable');
    }
    return this.engine;
  }
}
