import { normalizeClient as normalizeDomainClient } from '../../domain/clients/client.js';

export const CLIENT_FIELDS = Object.freeze(['name', 'fiscalName', 'phone', 'email', 'address', 'city', 'notes', 'active']);
export function normalizeClient(value = {}) {
  return normalizeDomainClient({ active: true, ...value });
}
const searchable = client => ['name', 'fiscalName', 'phone', 'email', 'city'].map(key => client[key] ?? '').join(' ').toLocaleLowerCase('it');
export function searchClients(clients, query = '') {
  const term = query.trim().toLocaleLowerCase('it');
  return term ? clients.filter(client => searchable(client).includes(term)) : [...clients];
}
export function sortClients(clients) { return [...clients].sort((a, b) => (a.name ?? '').localeCompare(b.name ?? '', 'it', { sensitivity: 'base' })); }
export function selectVisibleClients(clients, query) { return sortClients(searchClients(clients, query)); }
