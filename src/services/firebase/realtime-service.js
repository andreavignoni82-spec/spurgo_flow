export class RealtimeService {
  constructor({ subscribe, eventBus } = {}) { this.subscribeAdapter = subscribe; this.eventBus = eventBus; }
  watch(query, onData) {
    if (!this.subscribeAdapter) throw new Error('Firebase realtime adapter is not configured');
    return this.subscribeAdapter(query, onData, error => this.eventBus?.emit('sync:error', error));
  }
}
