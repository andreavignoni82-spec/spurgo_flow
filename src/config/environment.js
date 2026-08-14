const DEFAULT_FIREBASE_TEST = Object.freeze({
  host: '127.0.0.1', firestorePort: 8080, authPort: 9099,
  projectId: 'spurgoflow-v8-alpha3-test', apiKey: 'demo-test-only', useEmulator: true,
});

export function readEnvironment(source = globalThis.__SPURGO_FLOW_ENV__ ?? {}) {
  const driver = source.driver ?? 'memory';
  if (!['memory', 'firebase-emulator'].includes(driver)) throw new TypeError(`Unknown data driver: ${driver}`);
  const firebase = source.firebase ? { ...DEFAULT_FIREBASE_TEST, ...source.firebase } : null;
  if (driver === 'firebase-emulator' && !firebase) throw new Error('Firebase emulator configuration is missing');
  return Object.freeze({ driver, fallbackToMemory: source.fallbackToMemory === true, firebase: firebase && Object.freeze(firebase) });
}

export const environment = readEnvironment();
