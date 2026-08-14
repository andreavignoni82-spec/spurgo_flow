export function readOperatorForm(form) {
  return Object.fromEntries(['nome', 'cognome', 'username', 'password', 'telefono', 'mezzo', 'ruolo', 'teamId'].map(name => [name, form.elements.namedItem(name)?.value ?? '']));
}
