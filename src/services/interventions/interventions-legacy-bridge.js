// Temporary facade for non-migrated Agenda, Control Room, Reports and Operator UI.
// It owns no state: every command is delegated to the v7 domain service.
export class InterventionsLegacyBridge {
  constructor(service) { this.service=service; }
  create(data){return this.service.createIntervention(data)}
  update(id,patch){return this.service.updateIntervention(id,patch)}
  remove(id){return this.service.deleteIntervention(id)}
  changeStatus(id,status){return this.service.changeStatus(id,status)}
  assignOperators(id,ids){return this.service.assignOperators(id,ids)}
}
