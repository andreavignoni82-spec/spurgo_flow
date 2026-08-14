export function createAppContext({ eventBus, logger, services = {} }) {
  if (!eventBus || !logger) throw new TypeError('AppContext requires eventBus and logger');
  return Object.freeze({ eventBus, logger, services: Object.freeze({ ...services }) });
}
