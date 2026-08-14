import { buildOperatorAgendaModel, operatorTodayKey } from '../operator.model.js';
import { renderOperatorAgenda } from './operator-agenda.view.js';

export class OperatorAgenda {
  date = operatorTodayKey(); view = 'day';
  constructor({ onOpen } = {}) { this.onOpen = onOpen; }
  mount(container, interventions = []) { this.container = container; this.interventions = interventions; container.addEventListener('click', this.onClick); container.addEventListener('change', this.onChange); this.render(); }
  update(interventions = []) { this.interventions = interventions; this.render(); }
  unmount() { this.container?.removeEventListener('click', this.onClick); this.container?.removeEventListener('change', this.onChange); this.container = undefined; }
  render() { if (this.container) renderOperatorAgenda(this.container, buildOperatorAgendaModel({ interventions: this.interventions, date: this.date, view: this.view })); }
  onClick = event => {
    const block = event.target?.closest?.('[data-intervention-id]');
    if (block) return this.onOpen?.(block.dataset.interventionId);
    const view = event.target?.closest?.('[data-view]')?.dataset.view;
    if (view === 'day' || view === 'week') { this.view = view; this.render(); }
    if (event.target?.closest?.('[data-action="today"]')) { this.date = operatorTodayKey(); this.render(); }
  };
  onChange = event => { if (event.target?.matches?.('[data-role="date"]') && event.target.value) { this.date = event.target.value; this.render(); } };
}
