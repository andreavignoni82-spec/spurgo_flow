export function normalizePhoto(value = {}) {
  if (typeof value === 'string') return { data: value, category: 'FOTO', at: null };
  return {
    ...structuredClone(value),
    data: String(value.data ?? value.dataUrl ?? value.url ?? ''),
    category: String(value.category ?? 'FOTO'),
    at: value.at ?? value.createdAt ?? null
  };
}
