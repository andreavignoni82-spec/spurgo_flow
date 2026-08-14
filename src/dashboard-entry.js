import { bootstrap } from './core/bootstrap.js';
import { dashboardFeature } from './features/dashboard/dashboard.feature.js';
import { clientsFeature } from './features/clients/clients.feature.js';
import { fleetFeature } from './features/fleet/fleet.feature.js';
import { peopleFeature } from './features/people/people.feature.js';
import { interventionsFeature } from './features/interventions/interventions.feature.js';
import { agendaFeature } from './features/agenda/agenda.feature.js';
import { controlRoomFeature } from './features/control-room/control-room.feature.js';
import { messagesFeature } from './features/messages/messages.feature.js';
import { PlanningService } from './services/planning-service.js';
import { MapsService } from './services/maps-service.js';
import { LegacyAdapter } from './services/legacy-adapter.js';
import { ClientsRepository } from './services/repositories/clients-repository.js';
import { InterventionsRepository } from './services/repositories/interventions-repository.js';
import { MessagesRepository } from './services/repositories/messages-repository.js';
import { OperatorsRepository } from './services/repositories/operators-repository.js';
import { TeamsRepository } from './services/repositories/teams-repository.js';
import { VehiclesRepository } from './services/repositories/vehicles-repository.js';
import { AuthService } from './services/firebase/auth-service.js';
import { InterventionsService } from './services/interventions/interventions.service.js';
import { InterventionsLegacyBridge } from './services/interventions/interventions-legacy-bridge.js';

const adapter = new LegacyAdapter();
const repositories = Object.freeze({
  interventions: new InterventionsRepository({ list: () => adapter.interventions(), getById: id => adapter.interventionById(id), create: row => adapter.createIntervention(row), update: (id, patch) => adapter.updateIntervention(id, patch), remove: id => adapter.removeIntervention(id) }),
  operators: new OperatorsRepository({ list: () => adapter.operators(), getById: id => adapter.operatorById(id), create: row => adapter.createOperator(row), update: (id, patch) => adapter.updateOperator(id, patch), setActive: (id, active) => adapter.setOperatorActive(id, active) }),
  teams: new TeamsRepository({ list: () => adapter.teams(), getById: id => adapter.teamById(id), create: row => adapter.createTeam(row), update: (id, patch) => adapter.updateTeam(id, patch), remove: id => adapter.removeTeam(id) }),
  vehicles: new VehiclesRepository({
    list: () => adapter.vehicles(), getById: id => adapter.vehicleById(id),
    create: vehicle => adapter.createVehicle(vehicle), update: (id, patch) => adapter.updateVehicle(id, patch),
    remove: id => adapter.removeVehicle(id)
  }),
  messages: new MessagesRepository({ list: () => adapter.messages(), getById: id => adapter.messageById(id), create: row => adapter.createMessage(row), update: (id, patch) => adapter.updateMessage(id, patch), markRead: (id, reader) => adapter.markMessageRead(id, reader) }),
  clients: new ClientsRepository({
    list: () => adapter.clients(), getById: id => adapter.clientById(id),
    create: client => adapter.createClient(client), update: (id, patch) => adapter.updateClient(id, patch),
    remove: id => adapter.removeClient(id)
  })
});
const auth = new AuthService({ auth: {
  createOperatorAccount: ({ username, password, operator }) => window.SFCloud?.enabled ? window.SFCloud.provisionOperator({ ...operator, username }, password) : Promise.resolve({ email: `${username}@local`, localPassword: password }),
  signIn: credentials => window.SFCloud.login(credentials.username, credentials.password), signOut: () => window.SFCloud.logout()
} });
const services = { auth, logger: console, confirm: message => window.confirm(message), planning: new PlanningService(window.SFPlanning), maps: new MapsService({ renderControlRoom: () => window.renderControlMap?.() }) };
const app = bootstrap({ routes: { dashboard: dashboardFeature, clients: clientsFeature, fleet: fleetFeature, people: peopleFeature, interventions: interventionsFeature, agenda: agendaFeature, control: controlRoomFeature, messages: messagesFeature }, repositories, services });
services.interventions = new InterventionsService({ repository: repositories.interventions, eventBus: app.eventBus });
window.SFInterventionsBridge = new InterventionsLegacyBridge(services.interventions);

function activateDashboard() {
  const container = document.getElementById('dashboard');
  if (container) app.router.navigate('dashboard', container);
}

document.querySelectorAll('#menu [data-sec]').forEach(button => button.addEventListener('click', () => {
  if (button.dataset.sec === 'dashboard') activateDashboard();
  else if (button.dataset.sec === 'clienti') app.router.navigate('clients', document.getElementById('clienti'));
  else if (button.dataset.sec === 'flotta') app.router.navigate('fleet', document.getElementById('flotta'));
  else if (button.dataset.sec === 'squadre') app.router.navigate('people', document.getElementById('squadre'));
  else if (button.dataset.sec === 'interventi') app.router.navigate('interventions', document.getElementById('interventi'));
  else if (button.dataset.sec === 'agenda') app.router.navigate('agenda', document.getElementById('agenda'));
  else if (button.dataset.sec === 'control') app.router.navigate('control', document.getElementById('control'));
  else if (button.dataset.sec === 'messaggiUfficio') app.router.navigate('messages', document.getElementById('messaggiUfficio'));
  else { dashboardFeature.unmount(); clientsFeature.unmount(); fleetFeature.unmount(); peopleFeature.unmount(); interventionsFeature.unmount(); agendaFeature.unmount(); controlRoomFeature.unmount(); messagesFeature.unmount(); }
}));

app.eventBus.on('client:interventionRequested', ({ id }) => adapter.openInterventionForClient(id));
app.eventBus.on('intervention:openRequested', ({ id }) => adapter.openIntervention(id));

window.addEventListener('sf:data-changed', event => {
  const events = {
    interventions: 'intervention:updated', operators: 'operator:updated',
    teams: 'team:updated', vehicles: 'vehicle:updated', messages: 'message:updated'
  };
  const eventName = events[event.detail?.collection];
  if (eventName) app.eventBus.emit(eventName, event.detail);
  if (event.detail?.collection === 'clients' && document.getElementById('clienti')?.classList.contains('active')) {
    app.router.navigate('clients', document.getElementById('clienti'));
  }
  if (event.detail?.collection === 'vehicles' && document.getElementById('flotta')?.classList.contains('active')) {
    void fleetFeature.refresh();
  }
  if (['operators', 'teams'].includes(event.detail?.collection) && document.getElementById('squadre')?.classList.contains('active')) void peopleFeature.refresh();
});

activateDashboard();
