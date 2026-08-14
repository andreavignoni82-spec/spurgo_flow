import { AppState } from './app-state.js';
import { eventBus } from './event-bus.js';
import { FeatureBoundary } from './error-boundary.js';
import { Router } from './router.js';

export function bootstrap({ routes = {}, repositories = {}, services = {}, logger = console } = {}) {
  const state = new AppState();
  const boundary = new FeatureBoundary({ logger });
  const context = Object.freeze({ state, eventBus, repositories, services });
  const router = new Router({ boundary, context });
  Object.entries(routes).forEach(([route, feature]) => router.register(route, feature));
  return Object.freeze({ state, eventBus, boundary, router, context });
}
