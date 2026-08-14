import { EventBus } from '../core/event-bus.js';
import { ErrorBoundary } from '../core/error-boundary.js';
import { createLogger } from '../core/logger.js';
import { createAppContext } from './app-context.js';
import { Router } from './router.js';
import { features } from '../features/index.js';
import { renderBootFallback } from './fallback.js';

export async function bootstrap(container = document.querySelector('#app')) {
  if (!container) throw new Error('Bootstrap failed: #app container not found');
  const logger = createLogger();
  const eventBus = new EventBus({ onSubscriberError: (error, event) => logger.error('Event subscriber failed', { event, error }) });
  const boundary = new ErrorBoundary({ onError: (error, details) => logger.error('Feature failed', { ...details, error }) });
  const context = createAppContext({ eventBus, logger, services: {} });
  const router = new Router({ routes: features, container, context, errorBoundary: boundary, onMountError: () => renderBootFallback(container, 'Feature non disponibile') });
  const onNavigate = (event) => {
    const target = event.target.closest?.('[data-route]');
    if (target) router.navigate(target.dataset.route).catch((error) => {
      logger.error('Navigation failed', { error });
      renderBootFallback(container);
    });
  };
  container.addEventListener('click', onNavigate);
  if (!await router.navigate('dashboard')) throw new Error('Bootstrap failed: initial route "dashboard" was not mounted');
  return Object.freeze({ router });
}
