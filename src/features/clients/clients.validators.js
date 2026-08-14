import { validEmail } from '../../domain/shared/validators.js';

export function validateClientForm(value) {
  const errors = {};
  if (!value.name?.trim()) errors.name = 'Il nome è obbligatorio';
  if (value.email?.trim() && !validEmail(value.email.trim())) errors.email = 'Email non valida';
  return errors;
}

export const isClientFormValid = value => Object.keys(validateClientForm(value)).length === 0;
