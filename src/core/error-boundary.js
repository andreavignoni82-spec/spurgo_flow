export class ErrorBoundary {
  constructor({ onError = () => {} } = {}) { this.onError = onError; }
  run(operation, metadata = {}) {
    try { return operation(); }
    catch (error) { this.onError(error, metadata); return undefined; }
  }
  async runAsync(operation, metadata = {}) {
    try { return await operation(); }
    catch (error) { this.onError(error, metadata); return undefined; }
  }
}
