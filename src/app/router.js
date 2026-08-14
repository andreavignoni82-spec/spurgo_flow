import { createLifecycle } from '../core/lifecycle.js';
export class Router {
  #routes; #container; #context; #boundary; #active; #onMountError;
  constructor({ routes, container, context, errorBoundary, onMountError = () => {} }) { this.#routes = new Map(Object.entries(routes)); this.#container = container; this.#context = context; this.#boundary = errorBoundary; this.#onMountError = onMountError; }
  async navigate(route) {
    await this.#deactivate();
    const feature = this.#routes.get(route);
    if (!feature) return false;
    const lifecycle = createLifecycle();
    this.#active = { feature, lifecycle };
    let mounted = false;
    await this.#boundary.runAsync(async () => { await feature.mount(this.#container, { ...this.#context, lifecycle, signal: lifecycle.signal }); mounted = true; }, { featureId: feature.id, phase: 'mount' });
    if (!mounted) { this.#active = undefined; lifecycle.abort(); this.#onMountError(feature); }
    return mounted;
  }
  async #deactivate() {
    if (!this.#active) return;
    const { feature, lifecycle } = this.#active; this.#active = undefined;
    lifecycle.abort();
    await this.#boundary.runAsync(() => feature.unmount(), { featureId: feature.id, phase: 'unmount' });
  }
  async destroy() { await this.#deactivate(); }
}
