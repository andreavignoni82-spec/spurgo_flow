import { initializeApp, deleteApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { initializeFirestore, connectFirestoreEmulator, collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore';

const PRODUCTION_DISABLED = 'Firebase production is disabled in v8 alpha.3';
export function createFirebaseClient(config = {}) {
  if (config.useEmulator !== true) throw new Error(PRODUCTION_DISABLED);
  for (const key of ['host', 'firestorePort', 'authPort', 'projectId']) if (!config[key]) throw new Error(`Firebase emulator configuration is missing: ${key}`);
  const app = initializeApp({ projectId: config.projectId, apiKey: config.apiKey ?? 'demo-test-only' }, `spurgoflow-${crypto.randomUUID()}`);
  const firestore = initializeFirestore(app, { experimentalForceLongPolling: true });
  const auth = getAuth(app);
  connectFirestoreEmulator(firestore, config.host, config.firestorePort);
  connectAuthEmulator(auth, `http://${config.host}:${config.authPort}`, { disableWarnings: true });
  const adapter = {
    async list(name) { return (await getDocs(collection(firestore, name))).docs.map(item => item.data()); },
    async get(name, id) { const snapshot = await getDoc(doc(firestore, name, id)); return snapshot.exists() ? snapshot.data() : null; },
    async create(name, id, value) { const reference = doc(firestore, name, id); if ((await getDoc(reference)).exists()) { const error = new Error(`Duplicate document: ${id}`); error.code = 'already-exists'; throw error; } await setDoc(reference, value); return value; },
    async update(name, id, value) { await setDoc(doc(firestore, name, id), value); return value; },
    async remove(name, id) { const reference = doc(firestore, name, id); const snapshot = await getDoc(reference); if (!snapshot.exists()) { const error = new Error(`Missing document: ${id}`); error.code = 'not-found'; throw error; } await deleteDoc(reference); return snapshot.data(); },
    async query(name, field, value) { return (await getDocs(query(collection(firestore, name), where(field, '==', value)))).docs.map(item => item.data()); },
    async queryArray(name, field, value) { return (await getDocs(query(collection(firestore, name), where(field, 'array-contains', value)))).docs.map(item => item.data()); },
  };
  return Object.freeze({ app, auth, firestore, adapter, config: Object.freeze({ ...config }), close: () => deleteApp(app) });
}
export { PRODUCTION_DISABLED };
