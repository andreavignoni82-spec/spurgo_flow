import { EventBus } from '../core/event-bus.js';
import { ErrorBoundary } from '../core/error-boundary.js';
import { createLogger } from '../core/logger.js';
import { createAppContext } from './app-context.js';
import { Router } from './router.js';
import { features } from '../features/index.js';
import { renderBootFallback } from './fallback.js';
import { environment } from '../config/environment.js';
import { createRepositories } from '../infrastructure/repositories/create-repositories.js';
import { createFirebaseClient } from '../infrastructure/firebase/firebase-client.js';
import { createRealtimeAdapter } from '../infrastructure/firebase/realtime-adapter.js';
import { ClientsService } from '../services/clients/clients-service.js';
import { VehiclesService } from '../services/vehicles/vehicles-service.js';
import { OperatorsService } from '../services/operators/operators-service.js';
import { TeamsService } from '../services/teams/teams-service.js';
import { InterventionsService } from '../services/interventions/interventions-service.js';
import { ReportsService } from '../services/reports/reports-service.js';
import { MessagesService } from '../services/messages/messages-service.js';

export async function bootstrap(container = document.querySelector('#app')) {
  if (!container) throw new Error('Bootstrap failed: #app container not found');
  const logger = createLogger();
  const eventBus = new EventBus({ onSubscriberError: (error, event) => logger.error('Event subscriber failed', { event, error }) });
  const boundary = new ErrorBoundary({ onError: (error, details) => logger.error('Feature failed', { ...details, error }) });
  const firebaseClient = environment.driver === 'firebase-emulator' ? createFirebaseClient(environment.firebase) : undefined;
  const repositories = createRepositories({ driver: environment.driver, eventBus, firebaseClient, fallbackToMemory: environment.fallbackToMemory, logger });
  const realtime = firebaseClient ? createRealtimeAdapter({ firestore: firebaseClient.firestore }) : undefined;
  const context = createAppContext({ eventBus, logger, services: {
    clients: new ClientsService({ repository: repositories.clients, eventBus, realtime }),
    vehicles: new VehiclesService({ repository: repositories.vehicles, eventBus, realtime }),
    operators: new OperatorsService({ repository: repositories.operators }),
    teams: new TeamsService({ repository: repositories.teams }),
    interventions: new InterventionsService({ repository: repositories.interventions, eventBus }),
    reports: new ReportsService({ repository: repositories.reports, eventBus }),
    messages: new MessagesService({ repository: repositories.messages }),
  } });
  const router = new Router({ routes: features, container, context, errorBoundary: boundary, onMountError: feature => renderBootFallback(container, feature.id === 'fleet' ? 'Mezzi & Flotta temporaneamente non disponibili' : 'Feature non disponibile') });
  const onNavigate = (event) => {
    const target = event.target.closest?.('[data-route]');
    if (target) router.navigate(target.dataset.route).catch((error) => {
      logger.error('Navigation failed', { error });
      renderBootFallback(container);
    });
  };
  container.addEventListener('click', onNavigate);
  if (!await router.navigate('dashboard')) throw new Error('Bootstrap failed: initial route "dashboard" was not mounted');
  return Object.freeze({ router, close: async () => { await router.destroy(); await firebaseClient?.close(); } });
}
