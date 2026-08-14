export const INTERVENTION_STATUSES = Object.freeze(['Programmato', 'Urgente', 'In corso', 'Terminato', 'Annullato']);
const aliases = new Map(INTERVENTION_STATUSES.map(status => [status.toLowerCase(), status]));
export class InterventionStatusService {
  normalizeStatus(status) { return aliases.get(String(status ?? '').trim().toLowerCase()) ?? status; }
  canTransition(from, to) { return INTERVENTION_STATUSES.includes(this.normalizeStatus(from)) && INTERVENTION_STATUSES.includes(this.normalizeStatus(to)); }
  isCompleted(status) { return this.normalizeStatus(status) === 'Terminato'; }
  isActive(status) { return ['Programmato', 'Urgente', 'In corso'].includes(this.normalizeStatus(status)); }
}
