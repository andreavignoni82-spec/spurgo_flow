export class Router {
  #routes = new Map();
  #activeFeature;
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
    if (this.#activeFeature && this.#activeFeature !== feature) this.#activeFeature.unmount();
    const mount = () => feature.mount(container, this.context);
    const result = this.boundary ? this.boundary.run(feature.id, mount, container) : mount();
    this.#activeFeature = feature;
    return result;
  }
}
