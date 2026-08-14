import { collection, onSnapshot, query } from 'firebase/firestore';
import { clone } from '../../domain/shared/utils.js';
import { mapRepositoryError } from './errors.js';

const ALLOWED = new Set(['clients','operators','teams','vehicles','interventions','reports','messages']);
export function createRealtimeAdapter({ firestore, subscribe = (name, next, error) => onSnapshot(query(collection(firestore, name)), next, error) }) {
  const active = new Map();
  return Object.freeze({ subscribeCollection(name, callback, subscriptionId = callback) {
    if (!ALLOWED.has(name)) throw new TypeError(`Unsupported realtime collection: ${name}`);
    active.get(subscriptionId)?.();
    let closed = false;
    const stop = subscribe(name, snapshot => callback(Object.freeze({ type: 'snapshot', records: clone(snapshot.docs.map(item => item.data())), readOnly: true })), error => callback(Object.freeze({ type: 'error', error: mapRepositoryError(error), readOnly: true })));
    const unsubscribe = () => { if (!closed) { closed = true; stop(); if (active.get(subscriptionId) === unsubscribe) active.delete(subscriptionId); } };
    active.set(subscriptionId, unsubscribe); return unsubscribe;
  }, activeSubscriptionCount: () => active.size });
}
