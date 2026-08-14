import { bootstrap } from './core/bootstrap.js';
import { dashboardFeature } from './features/dashboard/dashboard.feature.js';
import { clientsFeature } from './features/clients/clients.feature.js';
import { LegacyAdapter } from './services/legacy-adapter.js';
import { ClientsRepository } from './services/repositories/clients-repository.js';
import { InterventionsRepository } from './services/repositories/interventions-repository.js';
import { MessagesRepository } from './services/repositories/messages-repository.js';
import { OperatorsRepository } from './services/repositories/operators-repository.js';
import { TeamsRepository } from './services/repositories/teams-repository.js';
import { VehiclesRepository } from './services/repositories/vehicles-repository.js';

const adapter = new LegacyAdapter();
const repositories = Object.freeze({
  interventions: new InterventionsRepository({ list: () => adapter.interventions() }),
  operators: new OperatorsRepository({ list: () => adapter.operators() }),
  teams: new TeamsRepository({ list: () => adapter.teams() }),
  vehicles: new VehiclesRepository({ list: () => adapter.vehicles() }),
  messages: new MessagesRepository({ list: () => adapter.messages() }),
  clients: new ClientsRepository({
    list: () => adapter.clients(), getById: id => adapter.clientById(id),
    create: client => adapter.createClient(client), update: (id, patch) => adapter.updateClient(id, patch),
    remove: id => adapter.removeClient(id)
  })
});
const app = bootstrap({ routes: { dashboard: dashboardFeature, clients: clientsFeature }, repositories });

function activateDashboard() {
  const container = document.getElementById('dashboard');
  if (container) app.router.navigate('dashboard', container);
}

document.querySelectorAll('#menu [data-sec]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.sec === 'dashboard') activateDashboard();
  else if (button.dataset.sec === 'clienti') app.router.navigate('clients', document.getElementById('clienti'));
  else { dashboardFeature.unmount(); clientsFeature.unmount(); }
}));

app.eventBus.on('client:interventionRequested', ({ id }) => adapter.openInterventionForClient(id));

window.addEventListener('sf:data-changed', event => {
  const events = {
    interventions: 'intervention:updated', operators: 'operator:updated',
    teams: 'team:updated', vehicles: 'vehicle:updated'
  };
  const eventName = events[event.detail?.collection];
  if (eventName) app.eventBus.emit(eventName, event.detail);
  if (event.detail?.collection === 'clients' && document.getElementById('clienti')?.classList.contains('active')) {
    app.router.navigate('clients', document.getElementById('clienti'));
  }
});

activateDashboard();
