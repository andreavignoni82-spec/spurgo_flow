const FALLBACK_MESSAGE = 'Modulo temporaneamente non disponibile';

export class FeatureBoundary {
  constructor({ logger = console } = {}) { this.logger = logger; }

  run(featureName, callback, container) {
    try { const result = callback(); return result?.then ? result.catch(error => this.#fail(featureName, error, container)) : result; }
    catch (error) {
      return this.#fail(featureName, error, container);
    }
  }
  #fail(featureName, error, container) { this.logger.error(`[${featureName}] feature failure`, error); if (container) container.textContent = FALLBACK_MESSAGE; return undefined; }
}

export { FALLBACK_MESSAGE };
