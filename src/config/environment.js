const FIREBASE_PROJECTS = new Set(['spurgoflow-test', 'spurgoflow-v8-alpha3-test']);

export class ConfigurationError extends Error {
  constructor(code, component, message) {
    super(message);
    this.name = 'ConfigurationError';
    this.code = code;
    this.component = component;
  }
}

function validateFirebaseConfig(firebase) {
  if (!firebase) throw new ConfigurationError('BOOT_CONFIG_FIREBASE_MISSING', 'environment.firebase', 'Firebase configuration is missing');
  for (const key of ['apiKey', 'projectId', 'authDomain']) {
    if (!firebase[key]) throw new ConfigurationError('BOOT_CONFIG_FIREBASE_FIELD_MISSING', `environment.firebase.${key}`, `Firebase configuration is missing: ${key}`);
  }
  if (firebase.useEmulator !== true) throw new ConfigurationError('BOOT_FIREBASE_PRODUCTION_DISABLED', 'environment.firebase.useEmulator', 'Firebase production is disabled');
  if (!FIREBASE_PROJECTS.has(firebase.projectId)) throw new ConfigurationError('BOOT_FIREBASE_PROJECT_BLOCKED', 'environment.firebase.projectId', 'Firebase project is not authorized');
}

export function createEnvironment(source = {}) {
  const requestedDriver = source.dataDriver ?? source.driver ?? 'memory';
  const driver = requestedDriver === 'firebase-emulator' ? 'firebase' : requestedDriver;
  if (!['memory', 'firebase'].includes(driver)) throw new ConfigurationError('BOOT_CONFIG_UNKNOWN_DRIVER', 'environment.driver', `Unknown data driver: ${requestedDriver}`);
  if (driver === 'memory') return Object.freeze({ driver, fallbackToMemory: false, firebase: null });
  const firebase = source.firebase ? Object.freeze({ ...source.firebase }) : null;
  validateFirebaseConfig(firebase);
  return Object.freeze({ driver, fallbackToMemory: source.fallbackToMemory === true, firebase });
}

export const readEnvironment = createEnvironment;
// Static UI modules may import this safe default. Runtime configuration is read
// by bootstrap, so an invalid global cannot turn a recoverable config error into
// a module-evaluation failure.
export const environment = createEnvironment();
