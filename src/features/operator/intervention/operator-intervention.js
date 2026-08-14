import { renderOperatorIntervention } from './operator-intervention.view.js';
export class OperatorIntervention {
  constructor(actions = {}) { this.actions = actions; }
  mount(container, state) { this.container = container; this.state = state; container.addEventListener('click', this.onClick); this.render(); }
  update(state) { this.state = state; this.render(); }
  unmount() { this.container?.removeEventListener('click', this.onClick); this.container = undefined; }
  render() { if (this.container) renderOperatorIntervention(this.container, this.state); }
  reportData() { const get = name => this.container?.querySelector(`[name="${name}"]`)?.value ?? ''; return { ...this.state.report, relation: get('relation'), notes: get('notes'), customerSigner: get('customerSigner') }; }
  onClick = event => { const action = event.target?.closest?.('[data-action]')?.dataset.action; if (action) this.actions[action]?.(this.reportData()); };
}
