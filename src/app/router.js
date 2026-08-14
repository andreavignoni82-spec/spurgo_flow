import { createLifecycle } from '../core/lifecycle.js';
export class Router {
  #routes; #container; #context; #boundary; #active;
  constructor({ routes, container, context, errorBoundary }) { this.#routes = new Map(Object.entries(routes)); this.#container = container; this.#context = context; this.#boundary = errorBoundary; }
  async navigate(route) {
    await this.#deactivate();
    const feature = this.#routes.get(route);
    if (!feature) return false;
    const lifecycle = createLifecycle();
    this.#active = { feature, lifecycle };
    await this.#boundary.runAsync(() => feature.mount(this.#container, { ...this.#context, lifecycle, signal: lifecycle.signal }), { featureId: feature.id, phase: 'mount' });
    return true;
  }
  async #deactivate() {
    if (!this.#active) return;
    const { feature, lifecycle } = this.#active; this.#active = undefined;
    lifecycle.abort();
    await this.#boundary.runAsync(() => feature.unmount(), { featureId: feature.id, phase: 'unmount' });
  }
  async destroy() { await this.#deactivate(); }
}
