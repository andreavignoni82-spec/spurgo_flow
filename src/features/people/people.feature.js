import { createPeopleModel } from './people.model.js';
import { renderPeople, renderPeopleFailure } from './people.view.js';
import { OperatorsController } from './operators/operators.controller.js';
import { TeamsController } from './teams/teams.controller.js';

export class PeopleFeature {
  id = 'people'; #container; #context; #model = createPeopleModel(); #operatorForm; #teamForm; #state = {}; #operators; #teams;
  #submit = event => { event.preventDefault(); if (event.target.matches('[data-role="operator-form"]')) void this.#saveOperator(event.target); if (event.target.matches('[data-role="team-form"]')) void this.#saveTeam(event.target); };
  #click = event => void this.#handleClick(event);
  async mount(container, context = {}) {
    if (!container) throw new TypeError('People container is required'); this.unmount(); this.#container = container; this.#context = context;
    const operators = context.repositories?.operators, teams = context.repositories?.teams;
    if (!operators?.list || !teams?.list || !context.services?.auth?.createOperatorAccount) throw new TypeError('People dependencies are required');
    this.#operators = new OperatorsController({ repository: operators, teamsRepository: teams, authService: context.services.auth, eventBus: context.eventBus, onChange: patch => this.#patch(patch) });
    this.#teams = new TeamsController({ repository: teams, eventBus: context.eventBus, onChange: patch => this.#patch(patch) });
    container.addEventListener('submit', this.#submit); container.addEventListener('click', this.#click);
    try { await this.refresh(); } catch (error) { context.services?.logger?.error?.('[people] failure', error); renderPeopleFailure(container); }
  }
  unmount() { this.#container?.removeEventListener('submit', this.#submit); this.#container?.removeEventListener('click', this.#click); this.#container = undefined; this.#context = undefined; this.#operatorForm = undefined; this.#teamForm = undefined; this.#state = {}; }
  async refresh() { const [operators, teams] = await Promise.all([this.#context.repositories.operators.list(), this.#context.repositories.teams.list()]); this.#model = createPeopleModel({ operators, teams }); this.#render(); }
  #patch(patch) { this.#state = { ...this.#state, ...patch }; this.#render(); }
  #render() { if (this.#container) renderPeople(this.#container, { ...this.#model, ...this.#state, operatorForm: this.#operatorForm, teamForm: this.#teamForm }); }
  async #saveOperator(form) { const saved = await this.#operators.save(form, this.#operatorForm); if (saved) { this.#operatorForm = undefined; await this.refresh(); } }
  async #saveTeam(form) { const saved = await this.#teams.save(form, this.#teamForm); if (saved) { this.#teamForm = undefined; await this.refresh(); } }
  async #handleClick(event) {
    const button = event.target.closest?.('[data-action]'); if (!button) return; const action = button.dataset.action;
    const operatorId = button.closest('[data-operator-id]')?.dataset.operatorId, teamId = button.closest('[data-team-id]')?.dataset.teamId;
    if (action === 'edit-operator') this.#operatorForm = this.#model.operators.find(row => row.id === operatorId);
    if (action === 'cancel-operator') this.#operatorForm = undefined;
    if (action === 'toggle-operator') { const operator = this.#model.operators.find(row => row.id === operatorId); await this.#operators.setActive(operatorId, !operator.active); await this.refresh(); return; }
    if (action === 'edit-team') this.#teamForm = this.#model.teams.find(row => row.id === teamId);
    if (action === 'cancel-team') this.#teamForm = undefined;
    if (action === 'delete-team' && globalThis.confirm?.('Eliminare la squadra?')) { await this.#teams.remove(teamId); await this.refresh(); return; }
    this.#render();
  }
}
export const peopleFeature = new PeopleFeature();
