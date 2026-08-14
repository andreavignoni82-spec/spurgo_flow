import { buildDashboardModel } from './dashboard.model.js';
import { renderDashboard } from './dashboard.view.js';

export const DASHBOARD_EVENTS = Object.freeze([
  'intervention:created', 'intervention:updated', 'intervention:deleted', 'intervention:statusChanged',
  'operator:created', 'operator:updated', 'team:updated', 'vehicle:updated'
]);

const REPOSITORIES = Object.freeze({
  interventions: 'interventions', operators: 'operators', teams: 'teams',
  vehicles: 'vehicles', messages: 'messages'
});

export class DashboardFeature {
  id = 'dashboard';
  #container;
  #context;
  #unsubscribers = [];
  #refreshVersion = 0;

  mount(container, context = {}) {
    if (!container) throw new TypeError('Dashboard container is required');
    if (this.#container === container && this.#context === context) return this.refresh();
    this.unmount();
    this.#container = container;
    this.#context = context;
    const bus = context.eventBus;
    if (!bus || typeof bus.on !== 'function') throw new TypeError('Dashboard EventBus is required');
    this.#validateRepositories();
    this.#unsubscribers = DASHBOARD_EVENTS.map(eventName => bus.on(eventName, () => this.refresh()));
    return this.refresh();
  }

  unmount() {
    this.#refreshVersion += 1;
    this.#unsubscribers.splice(0).forEach(unsubscribe => unsubscribe());
    this.#container = undefined;
    this.#context = undefined;
  }

  async refresh(payload) {
    if (!this.#container) return undefined;
    const version = ++this.#refreshVersion;
    try {
      const data = payload?.interventions ? payload : await this.#load();
      if (!this.#container || version !== this.#refreshVersion) return undefined;
      const model = buildDashboardModel(data);
      renderDashboard(this.#container, model);
      return model;
    } catch (error) {
      if (this.#container && version === this.#refreshVersion) {
        this.#container.textContent = 'Modulo temporaneamente non disponibile';
      }
      this.#context?.services?.logger?.error?.('[dashboard] refresh failure', error);
      return undefined;
    }
  }

  #validateRepositories() {
    for (const name of Object.values(REPOSITORIES)) {
      if (typeof this.#context?.repositories?.[name]?.list !== 'function') {
        throw new TypeError(`Dashboard repository is missing: ${name}`);
      }
    }
  }

  async #load() {
    const repositories = this.#context.repositories;
    const entries = await Promise.all(Object.entries(REPOSITORIES).map(async ([key, name]) =>
      [key, await repositories[name].list()]));
    return Object.fromEntries(entries);
  }
}

export const dashboardFeature = new DashboardFeature();
