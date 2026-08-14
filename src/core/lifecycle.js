export function createLifecycle() {
  const controller = new AbortController();
  return Object.freeze({
    signal: controller.signal,
    abort: (reason = 'Feature unmounted') => controller.abort(reason),
    addCleanup(cleanup) { controller.signal.addEventListener('abort', cleanup, { once: true }); return cleanup; },
  });
}
