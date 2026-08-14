import { readOperatorForm } from './operators.form.js';
import { operatorAccountError, validateOperator } from './operators.validators.js';
import { normalizeOperatorUsername } from '../../../shared/utils/operator-username.js';

export class OperatorsController {
  constructor({ repository, teamsRepository, authService, eventBus, onChange }) { Object.assign(this, { repository, teamsRepository, authService, eventBus, onChange }); this.saving = false; }
  async save(form, current) {
    if (this.saving) return;
    const values = readOperatorForm(form); const editing = Boolean(current?.id); const validation = validateOperator(values, { editing });
    if (!validation.valid) return this.onChange({ operatorErrors: validation.errors });
    this.saving = true; this.onChange({ operatorSaving: true, operatorError: '', operatorErrors: {} });
    try {
      if (editing) {
        const saved = await this.repository.update(current.id, validation.operator);
        this.eventBus?.emit('operator:updated', { id: current.id }); return saved;
      }
      const existing = await this.repository.list();
      if (existing.some(operator => normalizeOperatorUsername(operator.username) === validation.operator.username)) throw new Error('Username già utilizzato.');
      const draft = { ...validation.operator, id: globalThis.crypto?.randomUUID?.() || `op-${Date.now().toString(36)}` };
      let account;
      try { account = await this.authService.createOperatorAccount({ username: draft.username, password: values.password, operator: draft }); }
      catch (error) { throw Object.assign(new Error(operatorAccountError(error)), { step: 'account' }); }
      try {
        const saved = await this.repository.create({ ...draft, active: true, cloudUid: account?.uid, cloudEmail: account?.email, ...(account?.localPassword ? { password: account.localPassword } : {}) });
        if (values.teamId) {
          try { const team = await this.teamsRepository.getById(values.teamId); await this.teamsRepository.update(values.teamId, { operatorIds: [...new Set([...(team?.operatorIds || []), saved.id])] }); }
          catch (error) { throw new Error(`Operatore creato, ma associazione squadra non riuscita: ${error?.message || error}`); }
        }
        this.eventBus?.emit('operator:created', { id: saved.id }); return saved;
      } catch (error) {
        throw Object.assign(new Error(`Account creato, ma anagrafica non salvata. Contattare l'assistenza senza ricreare l'account: ${error?.message || error}`), { step: 'profile' });
      }
    } catch (error) { this.onChange({ operatorError: error.message }); return undefined; }
    finally { this.saving = false; this.onChange({ operatorSaving: false }); }
  }
  async setActive(id, active) { if (this.saving) return; this.saving = true; try { const saved = await this.repository.setActive(id, active); this.eventBus?.emit('operator:statusChanged', { id }); return saved; } finally { this.saving = false; } }
}
