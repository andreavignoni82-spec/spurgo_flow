const REQUIRED = ['clients', 'vehicles', 'operators', 'teams', 'interventions', 'reports', 'messages', 'auth'];
export function createAppContext({ eventBus, logger, services = {}, repositories = {}, realtime, router = null, lifecycle }) {
  if (!eventBus || !logger) throw new TypeError('AppContext requires eventBus and logger');
  for (const group of [{ name: 'services', value: services }, { name: 'repositories', value: repositories }]) {
    for (const key of REQUIRED.filter((item) => group.name === 'services' || item !== 'auth')) if (!group.value[key]) {
      const error = new TypeError(`AppContext missing ${group.name}.${key}`); error.code = 'BOOT_CONFIG_MISSING_SERVICE'; error.component = `${group.name}.${key}`; throw error;
    }
  }
  if (!realtime) { const error = new TypeError('AppContext missing realtime'); error.code = 'BOOT_CONFIG_MISSING_REALTIME'; error.component = 'realtime'; throw error; }
  return Object.freeze({ eventBus, logger, services: Object.freeze({ ...services }), repositories: Object.freeze({ ...repositories }), realtime, router, lifecycle });
}
