export const normalizeUsername = value => String(value ?? '').trim().toLowerCase();
export const operatorTestEmail = username => `${normalizeUsername(username)}@operator.spurgoflow.test`;
export const officeTestEmail = username => `${normalizeUsername(username)}@office.spurgoflow.test`;

export class AuthService {
  constructor({ adapter }) {
    if (!adapter) throw new TypeError('AuthService requires an auth adapter');
    this.adapter = adapter;
  }

  loginOperator(username, password) {
    return this.adapter.login(operatorTestEmail(username), password);
  }

  loginOffice(username, password) {
    const value = String(username ?? '').trim();
    return this.adapter.login(value.includes('@') ? value : officeTestEmail(value), password);
  }

  logout() { return this.adapter.logout(); }
  currentIdentity() { return this.adapter.currentIdentity(); }
  onAuthChanged(callback) { return this.adapter.onAuthChanged(callback); }
  createTestOperatorAccount(username, password) {
    return this.adapter.createTestAccount(operatorTestEmail(username), password);
  }
}
