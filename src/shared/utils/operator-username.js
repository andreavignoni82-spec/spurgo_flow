export function normalizeOperatorUsername(value) {
  return String(value ?? '').trim().toLowerCase();
}
