/**
 * @typedef {Object} Feature
 * @property {string} id
 * @property {(container: Element, context: object & {signal: AbortSignal, lifecycle: object}) => void|Promise<void>} mount
 * @property {() => void|Promise<void>} unmount
 */
export {};
