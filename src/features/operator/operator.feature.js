import { renderOperatorShell } from './operator.view.js';
import { OperatorAgenda } from './agenda/operator-agenda.js';
import { OperatorIntervention } from './intervention/operator-intervention.js';
import { OperatorReport } from './report/operator-report.js';
import { canOperatorAccessIntervention, operatorTeamIds, selectOperatorInterventions } from './operator.model.js';

const EVENTS = ['intervention:updated', 'intervention:statusChanged', 'intervention:assignmentChanged', 'intervention:completed', 'intervention:reopened', 'report:updated', 'report:signatureUpdated', 'report:photosUpdated'];
export class OperatorFeature {
  id = 'operator'; #off = []; #generation = 0; #completing = false; #localReportWrites = 0;
  async mount(container, context = {}) {
    if (!container) throw new TypeError('Operator container is required'); this.unmount();
    this.container = container; this.context = context; this.signal = context.lifecycle?.signal; const generation = ++this.#generation;
    const operator = context.operator ?? context.identity ?? context.services?.auth?.currentUser?.();
    if (!operator?.id) throw new Error('Operator identity is required'); this.operator = operator;
    this.content = renderOperatorShell(container, { operator });
    this.agenda = new OperatorAgenda({ onOpen: id => void this.open(id) });
    this.#off = EVENTS.map(name => context.eventBus?.on(name, payload => void this.#onRealtime(name, payload))).filter(Boolean);
    await this.refresh(); if (!this.#alive(generation)) return; this.agenda.mount(this.content, this.interventions);
  }
  async refresh() {
    const generation = this.#generation, services = this.context?.services, repositories = this.context?.repositories;
    if (!services?.interventions?.listInterventions) throw new Error('InterventionsService non disponibile');
    const [all, teams] = await Promise.all([services.interventions.listInterventions(), repositories?.teams?.list?.() ?? []]);
    if (!this.#alive(generation)) return; this.teams = teams; this.teamIds = operatorTeamIds(this.operator.id, teams); this.interventions = selectOperatorInterventions(all, this.operator.id, teams); this.agenda?.update(this.interventions);
  }
  async #onRealtime(name, payload = {}) {
    const eventId = String(payload.interventionId ?? payload.id ?? '');
    await this.refresh();
    if (!this.currentId || !eventId || eventId !== this.currentId) return;
    if (name === 'report:updated' && this.#localReportWrites) return;
    const intervention = await this.context.services.interventions.getIntervention(this.currentId);
    let report; let reportAvailable = true;
    if (name.startsWith('report:')) { try { report = await this.reportController.load(this.currentId); } catch { reportAvailable = false; } }
    if (this.#alive() && this.interventionView?.updateServerState({ intervention, report, reportAvailable })) {
      this.reportController.destroy(); this.reportController.mountEnhancements(this.content);
    }
  }
  async open(id) {
    const generation = this.#generation, service = this.context.services.interventions;
    const intervention = await service.getIntervention(id); if (!this.#alive(generation)) return;
    if (!canOperatorAccessIntervention(this.operator.id, intervention, this.teamIds)) { this.#message('Intervento non disponibile.'); return; }
    this.currentId = String(intervention.id); this.agenda?.unmount(); let report = {}, reportAvailable = true;
    this.reportController?.destroy(); this.reportController = new OperatorReport({ reportsService: this.context.services.reports, interventionsService: service, signal: this.signal, onMessage: text => this.#message(text) });
    try { report = await this.reportController.load(this.currentId); } catch { reportAvailable = false; }
    if (!this.#alive(generation)) return;
    this.interventionView?.unmount(); this.interventionView = new OperatorIntervention({
      back: () => this.showAgenda(), start: () => void this.start(), reopen: () => void this.reopen(),
      'save-report': data => void this.saveReport(data), complete: data => void this.complete(data)
    });
    this.interventionView.mount(this.content, { intervention, report, reportAvailable, busy: false }); this.reportController.mountEnhancements(this.content);
  }
  async start() { try { await this.context.services.interventions.startIntervention(this.currentId); if (this.#alive()) this.#message('Intervento iniziato'); } catch (error) { if (this.#alive()) this.#message(error.message); } }
  async reopen() { try { await this.context.services.interventions.reopenIntervention(this.currentId); } catch (error) { if (this.#alive()) this.#message(error.message); } }
  async saveReport(data) { this.#localReportWrites++; try { const saved = await this.reportController.save(this.currentId, await this.reportController.collect(data)); if (this.#alive()) this.interventionView?.markSaved(saved); } catch (error) { if (this.#alive() && error.name !== 'AbortError') this.#message(error.message); } finally { this.#localReportWrites--; } }
  async complete(data) { if (this.#completing || this.reportController.busy) return; this.#completing = true; this.#localReportWrites++; try { await this.reportController.complete(this.currentId, await this.reportController.collect(data)); } catch (error) { if (error.name === 'AbortError') return; } finally { this.#localReportWrites--; this.#completing = false; } }
  showAgenda() { this.currentId = undefined; this.reportController?.destroy(); this.interventionView?.unmount(); this.agenda.unmount(); this.agenda.mount(this.content, this.interventions); }
  unmount() { ++this.#generation; this.#off.splice(0).forEach(off => off()); this.agenda?.unmount(); this.interventionView?.unmount(); this.reportController?.destroy(); this.container = this.context = this.content = undefined; this.currentId = undefined; }
  #alive(generation = this.#generation) { return Boolean(this.container) && generation === this.#generation && !this.signal?.aborted; }
  #message(text) { if (!this.#alive()) return; const node = this.container.querySelector('[data-role="operator-message"]'); if (node) node.textContent = text; }
}
export const operatorFeature = new OperatorFeature();
