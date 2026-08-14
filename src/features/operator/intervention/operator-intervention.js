import { renderOperatorIntervention } from './operator-intervention.view.js';
export class OperatorIntervention {
  constructor(actions = {}) { this.actions = actions; }
  mount(container, state) { this.container = container; this.state = state; this.formDirty = false; container.addEventListener('click', this.onClick); container.addEventListener('input', this.onEdit); container.addEventListener('change', this.onEdit); this.render(); }
  update(state) { this.state = state; this.render(); }
  updateServerState({ intervention, report, reportAvailable } = {}) {
    if (intervention) this.state.intervention = intervention;
    if (!this.formDirty && report) { this.state.report = report; this.render(); return true; }
    if (reportAvailable !== undefined) this.state.reportAvailable = reportAvailable;
    if (!this.formDirty) return false;
    const notice = this.container?.querySelector('[data-role="server-update"]');
    if (notice) { notice.hidden = false; notice.textContent = 'Sono disponibili aggiornamenti dal server'; }
    return false;
  }
  markSaved(report) { this.state.report = report; this.formDirty = false; const notice = this.container?.querySelector('[data-role="server-update"]'); if (notice) notice.hidden = true; }
  unmount() { this.container?.removeEventListener('click', this.onClick); this.container?.removeEventListener('input', this.onEdit); this.container?.removeEventListener('change', this.onEdit); this.container = undefined; }
  render() { if (this.container) renderOperatorIntervention(this.container, this.state); }
  reportData() {
    const get = name => this.container?.querySelector(`[name="${name}"]`)?.value ?? '';
    const lines = name => get(name).split('\n').map(value => value.trim()).filter(Boolean).map(value => { try { return JSON.parse(value); } catch { return value; } });
    const data = { ...this.state.report, relation: get('relation'), activities: lines('activities'), anomaly: get('anomaly'), anomalies: lines('anomalies'), materials: lines('materials'), notes: get('notes'), customerSigner: get('customerSigner') };
    if (Object.hasOwn(this.state.report, 'quantities')) data.quantities = lines('quantities');
    return data;
  }
  onEdit = event => { if (event.target?.matches?.('input, textarea, select')) this.formDirty = true; };
  onClick = event => { const action = event.target?.closest?.('[data-action]')?.dataset.action; if (action) this.actions[action]?.(this.reportData()); };
}
