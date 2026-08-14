export class AvailabilityService {
  constructor({ get, set, eventBus } = {}) { this.getSource = get; this.setSource = set; this.eventBus = eventBus; }
  get(operatorId) { if (!this.getSource) return undefined; return this.getSource(operatorId); }
  async set(operatorId, available) { if (!this.setSource) throw new Error('AvailabilityService.set is not configured'); const result = await this.setSource(operatorId, Boolean(available)); this.eventBus?.emit('operator:availabilityChanged', { id: operatorId }); return result; }
}
