const FIELDS = Object.freeze(['id', 'name', 'address', 'city', 'phone', 'email', 'contact', 'notes']);
const text = value => String(value ?? '').trim();

export function normalizeClient(source = {}) {
  const client = {};
  for (const field of FIELDS) client[field] = text(source[field]);
  return Object.freeze(client);
}

export function filterClients(clients, query = '') {
  const needle = text(query).toLocaleLowerCase('it');
  const rows = (Array.isArray(clients) ? clients : []).map(normalizeClient);
  if (!needle) return rows;
  return rows.filter(client => FIELDS.slice(1).some(field => client[field].toLocaleLowerCase('it').includes(needle)));
}

export function sortClients(clients) {
  return [...(Array.isArray(clients) ? clients : [])].sort((a, b) =>
    text(a?.name).localeCompare(text(b?.name), 'it', { sensitivity: 'base' }));
}

export function validateClient(source) {
  if (!source || typeof source !== 'object' || Array.isArray(source)) return { valid: false, errors: { form: 'Dati cliente non validi.' } };
  const client = normalizeClient(source);
  const errors = {};
  if (!client.name) errors.name = 'Inserisci il nome cliente.';
  if (source.id != null && !client.id) errors.id = 'ID cliente non valido.';
  return { valid: !Object.keys(errors).length, errors, client };
}
