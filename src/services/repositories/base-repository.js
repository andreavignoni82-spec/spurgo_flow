export class RepositoryContract {
  constructor({ list } = {}) { this.listSource = list; }
  list() {
    if (typeof this.listSource !== 'function') return this.notImplemented('list');
    const result = this.listSource();
    return result instanceof Promise ? result.then(value => this.copy(value)) : this.copy(result);
  }
  copy(value) {
    if (typeof structuredClone === 'function') return structuredClone(value);
    return JSON.parse(JSON.stringify(value));
  }
  notImplemented(method) { throw new Error(`${this.constructor.name}.${method} is not implemented`); }
}
