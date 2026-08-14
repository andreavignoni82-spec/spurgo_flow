import { EventBus } from '../core/event-bus.js';
import { ErrorBoundary } from '../core/error-boundary.js';
import { createLogger } from '../core/logger.js';
import { createAppContext } from './app-context.js';
import { Router } from './router.js';
import { features } from '../features/index.js';
export async function bootstrap(container) {
  const logger = createLogger();
  const eventBus = new EventBus({ onSubscriberError: (error, event) => logger.error('Event subscriber failed', { event, error }) });
  const boundary = new ErrorBoundary({ onError: (error, details) => logger.error('Feature failed', { ...details, error }) });
  const context = createAppContext({ eventBus, logger, services: {} });
  const router = new Router({ routes: features, container, context, errorBoundary: boundary });
  await router.navigate('dashboard');
  return Object.freeze({ router });
}
