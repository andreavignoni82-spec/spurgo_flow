export const SIGNER_TYPES = Object.freeze(['operator', 'customer']);

export function normalizeSignature(value, signerType) {
  const source = typeof value === 'string' ? { dataUrl: value } : (value ?? {});
  const type = signerType ?? source.signerType;
  if (!SIGNER_TYPES.includes(type)) throw new Error('Tipo firmatario non valido');
  return {
    dataUrl: String(source.dataUrl ?? ''),
    signedAt: source.signedAt ?? new Date().toISOString(),
    signerType: type
  };
}
