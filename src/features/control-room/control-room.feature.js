import { buildControlRoomModel, buildResources } from './control-room.model.js';
import { renderAlternatives, renderControlRoom } from './control-room.view.js';

export const CONTROL_ROOM_EVENTS = Object.freeze([
  'intervention:created', 'intervention:updated', 'intervention:deleted', 'intervention:statusChanged', 'intervention:assignmentChanged', 'intervention:started', 'intervention:completed', 'intervention:reopened',
  'operator:updated', 'operator:statusChanged', 'operator:availabilityChanged', 'team:updated', 'vehicle:updated'
]);
const today = () => new Date().toISOString().slice(0, 10);

export class ControlRoomFeature {
  id = 'control';
  #container; #context; #date = today(); #data; #model; #unsubscribers = []; #refreshing; #timer;
  async mount(container, context = {}) {
    if (!container) throw new TypeError('Control Room container is required');
    this.unmount(); this.#container = container; this.#context = context; this.#date = today();
    container.addEventListener('click', this.#onClick); container.addEventListener('change', this.#onChange);
    this.#unsubscribers = CONTROL_ROOM_EVENTS.map(name => context.eventBus?.on(name, () => void this.refresh().catch(error => this.#fail(error)))).filter(Boolean);
    this.#timer = setInterval(() => void this.refresh().catch(error => this.#fail(error)), 60000);
    try { await this.refresh(); } catch (error) { this.#fail(error); }
  }
  unmount() {
    this.#container?.removeEventListener('click', this.#onClick); this.#container?.removeEventListener('change', this.#onChange);
    this.#unsubscribers.forEach(unsubscribe => unsubscribe()); this.#unsubscribers = [];
    if (this.#timer) clearInterval(this.#timer); this.#timer = undefined;
    this.#context?.services?.maps?.clear?.(this.#container?.querySelector?.('[data-role="map"]'));
    this.#container = undefined; this.#context = undefined; this.#refreshing = undefined;
  }
  refresh() {
    if (this.#refreshing) return this.#refreshing;
    const { repositories = {}, services = {} } = this.#context || {};
    if (!services.interventions?.listInterventions || !repositories.operators?.list || !repositories.teams?.list || !repositories.vehicles?.list) throw new TypeError('Control Room data APIs are required');
    this.#refreshing = Promise.all([services.interventions.listInterventions({ date: this.#date }), repositories.operators.list(), repositories.teams.list(), repositories.vehicles.list()])
      .then(([interventions, operators, teams, vehicles]) => { if (!this.#container) return; this.#data = { interventions, operators, teams, vehicles }; this.#rebuild(); })
      .finally(() => { this.#refreshing = undefined; });
    return this.#refreshing;
  }
  #rebuild(message = '', error = '') {
    const planning = this.#context?.services?.planning; const now = new Date(); const nowMinutes = now.getHours() * 60 + now.getMinutes();
    let planningData = { schedules: {}, statuses: {}, suggestions: [], nowMinutes }, degraded = false;
    try {
      const resources = buildResources(this.#data.operators, this.#data.teams);
      planningData = { ...planning.buildDay({ interventions: this.#data.interventions, resources, nowMinutes }), statuses: {}, suggestions: [] };
      resources.forEach(resource => { planningData.statuses[resource.id] = planning.classify(planningData.schedules[resource.id] || [], nowMinutes); });
      planningData.suggestions = this.#data.interventions.filter(item => String(item.priority || item.status).toLowerCase().includes('urgent')).map(intervention => ({ interventionId: intervention.id, urgent: true, alternatives: planning.alternatives({ intervention, resources, schedules: planningData.schedules, nowMinutes }) }));
    } catch (planningError) { degraded = true; this.#context?.services?.logger?.warn?.('[control-room] planning degraded', planningError); }
    this.#model = buildControlRoomModel({ date: this.#date, ...this.#data, planningData, degraded });
    renderControlRoom(this.#container, this.#model, { message, error });
    Promise.resolve(this.#context?.services?.maps?.render?.(this.#container.querySelector('[data-role="map"]'), this.#data.interventions)).catch(mapError => this.#context?.services?.logger?.warn?.('[control-room] map degraded', mapError));
  }
  #onClick = async event => {
    const action = event.target?.closest?.('[data-action]')?.dataset.action;
    if (action === 'today') { this.#date = today(); await this.refresh().catch(error => this.#fail(error)); return; }
    if (action === 'refresh') { await this.refresh().catch(error => this.#fail(error)); return; }
    const interventionId = event.target?.closest?.('[data-intervention-id]')?.dataset.interventionId;
    if (!action && interventionId) { this.#context?.eventBus?.emit('intervention:openRequested', { id: interventionId }); return; }
    if (action === 'alternatives') { renderAlternatives(this.#container, this.#model.suggestions.find(item => item.interventionId === interventionId)); return; }
    if (action === 'assign') await this.#assign(interventionId, event.target.closest('[data-resource-id]').dataset.resourceId);
  };
  #onChange = event => { if (event.target?.matches?.('[data-role="date"]') && event.target.value) { this.#date = event.target.value; void this.refresh().catch(error => this.#fail(error)); } };
  async #assign(interventionId, resourceId) {
    if (this.#context?.services?.confirm && !this.#context.services.confirm('Confermare la riassegnazione?')) return;
    try {
      if (resourceId.startsWith('team:')) await this.#context.services.interventions.assignTeam(interventionId, resourceId.slice(5));
      else await this.#context.services.interventions.assignOperator(interventionId, resourceId.replace(/^op:/, ''));
      await this.refresh(); this.#context.eventBus?.emit('controlRoom:suggestionApplied', { id: interventionId, resourceId }); this.#rebuild('Riassegnazione completata.');
    } catch (error) { this.#rebuild('', `Riassegnazione non riuscita: ${error.message}`); }
  }
  #fail(error) { this.#context?.services?.logger?.error?.('[control-room] failure', error); if (this.#container) this.#container.textContent = 'Modulo Control Room temporaneamente non disponibile'; }
}
export const controlRoomFeature = new ControlRoomFeature();
