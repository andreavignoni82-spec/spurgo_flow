const unsubscribe = () => {};
export function createNoopRealtimeAdapter() {
  return Object.freeze({
    subscribeCollection() { return unsubscribe; },
    subscribeEntity() { return unsubscribe; },
    activeSubscriptionCount: () => 0,
    health: () => Object.freeze({ status: 'local', mode: 'noop' }),
  });
}
