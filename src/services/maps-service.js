export class MapsService {
  constructor({ renderControlRoom, clearControlRoom } = {}) {
    this.renderControlRoom = renderControlRoom;
    this.clearControlRoom = clearControlRoom;
  }
  render(container, interventions) { return this.renderControlRoom?.(container, interventions); }
  clear(container) { return this.clearControlRoom?.(container); }
}
