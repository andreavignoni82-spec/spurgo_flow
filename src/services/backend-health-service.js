export class BackendHealthService {
  constructor({ driver, auth, realtime }) { Object.assign(this, { driver, auth, realtime }); }
  status() {
    if (this.driver === 'memory') return Object.freeze({ data: 'connected', auth: 'local/noop', realtime: 'local/noop' });
    return Object.freeze({ data: 'connected', auth: this.auth ? 'connected' : 'unavailable', realtime: this.realtime ? 'connected' : 'unavailable' });
  }
}
