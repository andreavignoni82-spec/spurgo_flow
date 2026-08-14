export function createMemoryAuthAdapter() {
  let current = null;
  const listeners = new Set();
  const publish = () => listeners.forEach((listener) => listener(current));
  return Object.freeze({
    async login(email) { current = Object.freeze({ uid: `memory:${email}`, email }); publish(); return current; },
    async logout() { current = null; publish(); },
    currentIdentity: () => current,
    onAuthChanged(callback) { listeners.add(callback); callback(current); return () => listeners.delete(callback); },
    async createTestAccount(email) { return this.login(email); },
    health: () => Object.freeze({ status: 'local', mode: 'memory' }),
  });
}
