export const clone = (value) => value == null ? value : structuredClone(value);
export const clean = (record) => Object.fromEntries(Object.entries(record).filter(([, value]) => value !== undefined));
export const text = (value) => typeof value === 'string' ? value.trim() : value;
export const now = () => new Date().toISOString();
export function createId(randomUUID = globalThis.crypto?.randomUUID?.bind(globalThis.crypto)) {
  if (randomUUID) return randomUUID();
  const bytes = new Uint8Array(16); globalThis.crypto?.getRandomValues?.(bytes);
  if (!bytes.some(Boolean)) for (let i = 0; i < bytes.length; i += 1) bytes[i] = Math.floor(Math.random() * 256);
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  return [...bytes].map((byte, i) => `${[4, 6, 8, 10].includes(i) ? '-' : ''}${byte.toString(16).padStart(2, '0')}`).join('');
}
