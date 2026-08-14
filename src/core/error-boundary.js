const FALLBACK_MESSAGE = 'Modulo temporaneamente non disponibile';

export class FeatureBoundary {
  constructor({ logger = console } = {}) { this.logger = logger; }

  run(featureName, callback, container) {
    try { return callback(); }
    catch (error) {
      this.logger.error(`[${featureName}] feature failure`, error);
      if (container) container.textContent = FALLBACK_MESSAGE;
      return undefined;
    }
  }
}

export { FALLBACK_MESSAGE };
