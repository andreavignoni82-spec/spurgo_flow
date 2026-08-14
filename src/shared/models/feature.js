/**
 * Feature contract: { id, mount(container, context), unmount(), refresh?(payload) }.
 * @param {unknown} candidate
 */
export function isFeature(candidate) {
  return Boolean(candidate && typeof candidate.id === 'string' &&
    typeof candidate.mount === 'function' && typeof candidate.unmount === 'function' &&
    (candidate.refresh === undefined || typeof candidate.refresh === 'function'));
}
