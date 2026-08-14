export class Router {
  #routes = new Map();
  #activeFeature;
  #lifecycle;
  constructor({ boundary, context = {} } = {}) { this.boundary = boundary; this.context = context; }
  register(route, feature) {
    if (!feature?.id || typeof feature.mount !== 'function' || typeof feature.unmount !== 'function') {
      throw new TypeError('feature must implement id, mount and unmount');
    }
    this.#routes.set(route, feature);
    return this;
  }
  navigate(route, container) {
    const feature = this.#routes.get(route);
    if (!feature) throw new Error(`Unknown route: ${route}`);
    if (this.#activeFeature) this.#activeFeature.unmount();
    this.#lifecycle?.abort(); this.#lifecycle = new AbortController();
    const mount = () => feature.mount(container, { ...this.context, lifecycle: { signal: this.#lifecycle.signal } });
    const result = this.boundary ? this.boundary.run(feature.id, mount, container) : mount();
    this.#activeFeature = feature;
    return result;
  }
}
