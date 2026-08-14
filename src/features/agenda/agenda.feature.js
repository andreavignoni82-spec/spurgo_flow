import { buildAgendaDayModel, buildAgendaWeekModel, resourceColor, todayKey } from './agenda.model.js';
import { renderAgenda } from './agenda.view.js';

const EVENTS = Object.freeze([
  'intervention:created', 'intervention:updated', 'intervention:deleted', 'intervention:statusChanged',
  'intervention:assignmentChanged', 'operator:updated', 'operator:statusChanged', 'team:updated'
]);

export class AgendaFeature {
  id = 'agenda';
  #container; #context; #interventions = []; #operators = []; #teams = []; #unsubscribers = [];
  #date = todayKey(); #view = 'day'; #refreshing;

  async mount(container, context = {}) {
    if (!container) throw new TypeError('Agenda container is required');
    this.unmount();
    this.#container = container; this.#context = context; this.#date = todayKey(); this.#view = 'day';
    container.addEventListener('click', this.#onClick);
    container.addEventListener('change', this.#onChange);
    this.#unsubscribers = EVENTS.map(event => context.eventBus?.on(event, payload => this.#onDomainEvent(event, payload))).filter(Boolean);
    try { await this.refresh(); } catch (error) { this.#fail(error); }
  }

  unmount() {
    this.#container?.removeEventListener('click', this.#onClick);
    this.#container?.removeEventListener('change', this.#onChange);
    this.#unsubscribers.forEach(unsubscribe => unsubscribe()); this.#unsubscribers = [];
    this.#container = undefined; this.#context = undefined; this.#refreshing = undefined;
  }

  refresh() {
    if (this.#refreshing) return this.#refreshing;
    const repositories = this.#context?.repositories;
    const service = this.#context?.services?.interventions;
    if (!service?.listInterventions || !repositories?.operators?.list || !repositories?.teams?.list) throw new TypeError('Agenda data APIs are required');
    this.#refreshing = Promise.all([service.listInterventions(), repositories.operators.list(), repositories.teams.list()])
      .then(([interventions, operators, teams]) => {
        if (!this.#container) return;
        this.#interventions = interventions; this.#operators = operators; this.#teams = teams; this.#render();
      }).finally(() => { this.#refreshing = undefined; });
    return this.#refreshing;
  }

  #render() {
    renderAgenda(this.#container, {
      view: this.#view, date: this.#date, color: resourceColor,
      dayModel: buildAgendaDayModel({ date: this.#date, interventions: this.#interventions, operators: this.#operators, teams: this.#teams }),
      weekModel: buildAgendaWeekModel({ date: this.#date, interventions: this.#interventions })
    });
  }

  #onClick = event => {
    const block = event.target?.closest?.('[data-intervention-id]');
    if (block) { this.#context?.eventBus?.emit('intervention:openRequested', { id: block.dataset.interventionId }); return; }
    const view = event.target?.closest?.('[data-view]')?.dataset.view;
    if (view === 'day' || view === 'week') { this.#view = view; this.#render(); return; }
    if (event.target?.closest?.('[data-action="today"]')) { this.#date = todayKey(); this.#render(); }
  };

  #onChange = event => {
    if (event.target?.matches?.('[data-role="date"]') && event.target.value) { this.#date = event.target.value; this.#render(); }
  };

  #onDomainEvent(event, payload = {}) {
    if (event.startsWith('operator:') || event === 'team:updated') { void this.refresh().catch(error => this.#fail(error)); return; }
    const cached = this.#interventions.find(item => String(item.id) === String(payload.id));
    if (payload.date && payload.date !== this.#date && cached?.date !== this.#date) return;
    if (!payload.date && cached && cached.date !== this.#date && event !== 'intervention:created') return;
    void this.refresh().catch(error => this.#fail(error));
  }

  #fail(error) {
    this.#context?.services?.logger?.error?.('[agenda] failure', error);
    if (this.#container) this.#container.textContent = 'Modulo Agenda temporaneamente non disponibile';
  }
}

export const agendaFeature = new AgendaFeature();
