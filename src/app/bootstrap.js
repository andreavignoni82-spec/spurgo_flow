import { EventBus } from '../core/event-bus.js';
import { ErrorBoundary } from '../core/error-boundary.js';
import { createLifecycle } from '../core/lifecycle.js';
import { createLogger } from '../core/logger.js';
import { createEnvironment } from '../config/environment.js';
import { createRepositories } from '../infrastructure/repositories/create-repositories.js';
import { createMemoryAuthAdapter } from '../infrastructure/auth/memory-auth-adapter.js';
import { createNoopRealtimeAdapter } from '../infrastructure/realtime/noop-realtime-adapter.js';
import { AuthService } from '../services/auth/auth-service.js';
import { BackendHealthService } from '../services/backend-health-service.js';
import { ClientsService } from '../services/clients/clients-service.js';
import { VehiclesService } from '../services/vehicles/vehicles-service.js';
import { OperatorsService } from '../services/operators/operators-service.js';
import { TeamsService } from '../services/teams/teams-service.js';
import { InterventionsService } from '../services/interventions/interventions-service.js';
import { ReportsService } from '../services/reports/reports-service.js';
import { MessagesService } from '../services/messages/messages-service.js';
import { createAppContext } from './app-context.js';
import { Router } from './router.js';
import { features } from '../features/index.js';
import { renderBootFallback } from './fallback.js';

async function infrastructureFor(environment) {
  if (environment.driver === 'memory') return { firebaseClient: null, authAdapter: createMemoryAuthAdapter(), realtime: createNoopRealtimeAdapter() };
  const [{ createFirebaseClient }, { createFirebaseAuthAdapter }, { createRealtimeAdapter }] = await Promise.all([
    import('../infrastructure/firebase/firebase-client.js'), import('../infrastructure/firebase/firebase-auth-adapter.js'), import('../infrastructure/firebase/realtime-adapter.js'),
  ]);
  const firebaseClient = createFirebaseClient(environment.firebase);
  return { firebaseClient, authAdapter: createFirebaseAuthAdapter({ auth: firebaseClient.auth, useEmulator: environment.firebase.useEmulator }), realtime: createRealtimeAdapter({ firestore: firebaseClient.firestore }) };
}

export async function bootstrap(container = document.querySelector('#app'), options = {}) {
  if (!container) { const error = new Error('Bootstrap failed: #app container not found'); error.code = 'BOOT_APP_CONTAINER_MISSING'; error.component = '#app'; throw error; }
  const logger = options.logger ?? createLogger();
  const environment = options.environment ?? createEnvironment(options.environmentSource ?? globalThis.__SPURGO_FLOW_ENV__ ?? {});
  logger.info('BOOT 1 - environment', { driver: environment.driver });
  const eventBus = new EventBus({ onSubscriberError: (error, event) => logger.error('Event subscriber failed', { event, error }) });
  const boundary = new ErrorBoundary({ onError: (error, details) => logger.error('Feature failed', { ...details, error }) });
  const infra = await infrastructureFor(environment);
  const repositories = createRepositories({ driver: environment.driver, eventBus, firebaseClient: infra.firebaseClient, fallbackToMemory: environment.fallbackToMemory, logger });
  logger.info('BOOT 2 - repositories');
  const services = {
    clients: new ClientsService({ repository: repositories.clients, eventBus, realtime: infra.realtime }), vehicles: new VehiclesService({ repository: repositories.vehicles, eventBus, realtime: infra.realtime }),
    operators: new OperatorsService({ repository: repositories.operators }), teams: new TeamsService({ repository: repositories.teams }), interventions: new InterventionsService({ repository: repositories.interventions, eventBus }),
    reports: new ReportsService({ repository: repositories.reports, eventBus }), messages: new MessagesService({ repository: repositories.messages }), auth: new AuthService({ adapter: infra.authAdapter }),
  };
  services.backendHealth = new BackendHealthService({ driver: environment.driver, auth: services.auth, realtime: infra.realtime });
  logger.info('BOOT 3 - services'); logger.info('BOOT 4 - auth', { mode: environment.driver === 'memory' ? 'local' : 'firebase' }); logger.info('BOOT 5 - realtime', { mode: environment.driver === 'memory' ? 'noop' : 'firebase' });
  const lifecycle = createLifecycle();
  const context = createAppContext({ eventBus, logger, services, repositories, realtime: infra.realtime, lifecycle });
  logger.info('BOOT 6 - routes', { count: Object.keys(features).length });
  const router = new Router({ routes: features, container, context, errorBoundary: boundary, onMountError: feature => renderBootFallback(container, `${feature.id} temporaneamente non disponibile`) });
  const onNavigate = (event) => { const target = event.target.closest?.('[data-route]'); if (target) router.navigate(target.dataset.route).catch((error) => logger.error('Navigation failed', { error })); };
  container.addEventListener('click', onNavigate); logger.info('BOOT 7 - shell');
  if (!await router.navigate(options.initialRoute ?? 'dashboard')) throw new Error('Bootstrap failed: initial route was not mounted');
  logger.info('BOOT 8 - initial route', { route: options.initialRoute ?? 'dashboard' });
  return Object.freeze({ router, environment, context, close: async () => { container.removeEventListener('click', onNavigate); lifecycle.abort(); await router.destroy(); await infra.firebaseClient?.close(); } });
}
