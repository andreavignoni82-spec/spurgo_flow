import { normalizeOperatorUsername } from '../../../shared/utils/operator-username.js';

export function validateOperator(source = {}, { editing = false } = {}) {
  const operator = { nome: String(source.nome ?? '').trim(), cognome: String(source.cognome ?? '').trim(), telefono: String(source.telefono ?? '').trim(), mezzo: String(source.mezzo ?? '').trim(), ruolo: String(source.ruolo ?? '').trim() || 'Operatore' };
  if (!editing) operator.username = normalizeOperatorUsername(source.username);
  const errors = {};
  if (!operator.nome) errors.nome = 'Inserisci il nome.';
  if (!editing && !operator.username) errors.username = 'Inserisci lo username.';
  if (!editing && !source.password) errors.password = 'Inserisci la password.';
  return { valid: !Object.keys(errors).length, errors, operator };
}

export function operatorAccountError(error) {
  if (error?.code === 'auth/email-already-in-use' || String(error?.message).includes('email-already-in-use')) return 'Username già utilizzato.';
  return `Account operatore non creato: ${error?.message || error}`;
}
