export function createMemoryAuthAdapter() {
  let current = null;
  const listeners = new Set();
  const publish = () => listeners.forEach((listener) => listener(current));
  return Object.freeze({
    async login(email, password) {
      if (email === 'ufficio@office.spurgoflow.test' && password !== 'ufficio') throw new Error('Credenziali Ufficio non valide');
      current = Object.freeze({ uid: `memory:${email}`, email }); publish(); return current;
    },
    async logout() { current = null; publish(); },
    currentIdentity: () => current,
    onAuthChanged(callback) { listeners.add(callback); callback(current); return () => listeners.delete(callback); },
    async createTestAccount(email, password) { return this.login(email, password); },
    health: () => Object.freeze({ status: 'local', mode: 'memory' }),
  });
}
