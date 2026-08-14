import { normalizeOperatorUsername } from '../../shared/utils/operator-username.js';

export class AuthService {
  constructor({ auth, eventBus, operatorEmailDomain = 'operator.spurgoflow.local' } = {}) { this.auth = auth; this.eventBus = eventBus; this.operatorEmailDomain = operatorEmailDomain; }
  cloudEmail(username) { return `${normalizeOperatorUsername(username)}@${this.operatorEmailDomain}`; }
  async createOperatorAccount({ username, password, operator } = {}) {
    if (!this.auth?.createOperatorAccount) throw new Error('Operator account adapter is not configured');
    return this.auth.createOperatorAccount({ username: normalizeOperatorUsername(username), password, operator });
  }
  async login(credentials) {
    if (!this.auth?.signIn) throw new Error('Firebase Auth adapter is not configured');
    const user = await this.auth.signIn({ ...credentials, username: normalizeOperatorUsername(credentials?.username) });
    this.eventBus?.emit('auth:login', user);
    return user;
  }
  async logout() {
    if (!this.auth?.signOut) throw new Error('Firebase Auth adapter is not configured');
    await this.auth.signOut();
    this.eventBus?.emit('auth:logout');
  }
}
