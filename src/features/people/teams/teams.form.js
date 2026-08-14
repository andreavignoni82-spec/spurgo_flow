export function readTeamForm(form) {
  return { name: form.elements.namedItem('name')?.value?.trim() ?? '', vehicle: form.elements.namedItem('vehicle')?.value?.trim() ?? '', operatorIds: [...form.querySelectorAll('[name="operatorIds"]:checked')].map(input => input.value) };
}
