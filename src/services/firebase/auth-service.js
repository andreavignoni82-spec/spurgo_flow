export class AuthService {
  constructor({ auth, eventBus } = {}) { this.auth = auth; this.eventBus = eventBus; }
  async login(credentials) {
    if (!this.auth?.signIn) throw new Error('Firebase Auth adapter is not configured');
    const user = await this.auth.signIn(credentials);
    this.eventBus?.emit('auth:login', user);
    return user;
  }
  async logout() {
    if (!this.auth?.signOut) throw new Error('Firebase Auth adapter is not configured');
    await this.auth.signOut();
    this.eventBus?.emit('auth:logout');
  }
}
