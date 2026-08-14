import { readTeamForm } from './teams.form.js';

export class TeamsController {
  constructor({ repository, eventBus, onChange }) { Object.assign(this, { repository, eventBus, onChange }); this.saving = false; }
  async save(form, current) {
    if (this.saving) return; const team = readTeamForm(form);
    if (!team.name) return this.onChange({ teamError: 'Inserisci il nome della squadra.' });
    this.saving = true; this.onChange({ teamSaving: true, teamError: '' });
    try { const saved = current?.id ? await this.repository.update(current.id, team) : await this.repository.create(team); this.eventBus?.emit(current?.id ? 'team:updated' : 'team:created', { id: saved.id }); return saved; }
    catch (error) { this.onChange({ teamError: `Squadra non salvata: ${error?.message || error}` }); return undefined; }
    finally { this.saving = false; this.onChange({ teamSaving: false }); }
  }
  async remove(id) { if (this.saving) return; this.saving = true; try { await this.repository.remove(id); this.eventBus?.emit('team:deleted', { id }); return true; } catch (error) { this.onChange({ teamError: `Squadra non eliminata: ${error?.message || error}` }); return false; } finally { this.saving = false; } }
}
