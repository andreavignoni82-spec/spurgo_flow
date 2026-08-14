export function createLogger(sink = console) {
  return Object.freeze({
    info: (...args) => sink.info(...args),
    warn: (...args) => sink.warn(...args),
    error: (...args) => sink.error(...args),
  });
}
