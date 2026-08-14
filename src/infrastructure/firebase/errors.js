export class RepositoryError extends Error {
  constructor(code, message, options) { super(message, options); this.name = 'RepositoryError'; this.code = code; }
}
export class AuthError extends Error {
  constructor(code, message, options) { super(message, options); this.name = 'AuthError'; this.code = code; }
}
export function mapRepositoryError(error) {
  if (error instanceof RepositoryError) return error;
  const code = error?.code === 'unavailable' || error?.code === 'firestore/unavailable' ? 'DATA_UNAVAILABLE' : 'DATA_ERROR';
  return new RepositoryError(code, code === 'DATA_UNAVAILABLE' ? 'Data service is unavailable' : 'Data operation failed', { cause: error });
}
export function mapAuthError(error) {
  if (error instanceof AuthError) return error;
  const codes = { 'auth/invalid-credential': 'INVALID_CREDENTIALS', 'auth/wrong-password': 'INVALID_CREDENTIALS', 'auth/user-not-found': 'INVALID_CREDENTIALS', 'auth/user-disabled': 'USER_DISABLED' };
  const code = codes[error?.code] ?? 'AUTH_ERROR';
  return new AuthError(code, code === 'INVALID_CREDENTIALS' ? 'Invalid credentials' : code === 'USER_DISABLED' ? 'User is disabled' : 'Authentication failed', { cause: error });
}
