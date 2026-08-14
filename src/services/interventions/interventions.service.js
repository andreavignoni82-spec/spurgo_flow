import { InterventionStatusService } from './intervention-status.service.js';
import { InterventionAssignmentService } from './intervention-assignment.service.js';

const requiredId = id => { if (id == null || String(id).trim() === '') throw new TypeError('Intervention id is required'); return String(id); };
export class InterventionsService {
  constructor({ repository, eventBus, statusService=new InterventionStatusService(), assignmentService=new InterventionAssignmentService(), idFactory=()=>`INT-${crypto.randomUUID()}`, now=()=>new Date().toISOString() }={}) {
    if (!repository) throw new TypeError('Interventions repository is required');
    this.repository=repository; this.eventBus=eventBus; this.status=statusService; this.assignment=assignmentService; this.idFactory=idFactory; this.now=now;
  }
  async createIntervention(data) { const record={...structuredClone(data??{}),id:requiredId(data?.id ?? this.idFactory())}; const saved=await this.repository.create(record); this.#emit('intervention:created', saved.id, 'created'); return saved; }
  async updateIntervention(id, patch) { id=requiredId(id); if (patch?.id != null && String(patch.id)!==id) throw new Error('Intervention identity is immutable'); const clean={...patch};delete clean.id;const saved=await this.repository.update(id,clean); this.#emit('intervention:updated',id,'updated'); return saved; }
  async deleteIntervention(id) { id=requiredId(id); const result=await this.repository.remove(id); this.#emit('intervention:deleted',id,'deleted'); return result; }
  assignOperator(id,value){return this.#assignment(id,this.assignment.operator(value));}
  assignOperators(id,value){return this.#assignment(id,this.assignment.operators(value));}
  assignTeam(id,value){return this.#assignment(id,this.assignment.team(value));}
  assignVehicle(id,value){return this.#assignment(id,this.assignment.vehicle(value));}
  async changeStatus(id,newStatus) { id=requiredId(id); const current=await this.getIntervention(id); if(!current)throw new Error('Intervention not found'); const status=this.status.normalizeStatus(newStatus); if(!this.status.canTransition(current.status,status))throw new Error('Invalid intervention status transition'); const saved=await this.repository.update(id,{status}); this.#emit('intervention:statusChanged',id,'statusChanged',{previousStatus:current.status,status}); return saved; }
  async startIntervention(id) { const current=await this.getIntervention(id); const at=this.now(); const saved=await this.repository.update(requiredId(id),{status:'In corso',startedAt:at}); this.#emit('intervention:statusChanged',id,'statusChanged',{previousStatus:current?.status,status:'In corso'}); this.#emit('intervention:started',id,'started'); return saved; }
  async completeIntervention(id,data={}) { const current=await this.getIntervention(id); const at=this.now(); const patch={...data,status:'Terminato',endedAt:data.endedAt??data.actualEnd??at};delete patch.actualEnd;const saved=await this.repository.update(requiredId(id),patch); this.#emit('intervention:statusChanged',id,'statusChanged',{previousStatus:current?.status,status:'Terminato'}); this.#emit('intervention:completed',id,'completed'); return saved; }
  async reopenIntervention(id) { const current=await this.getIntervention(id); const saved=await this.repository.update(requiredId(id),{status:'In corso',endedAt:null}); this.#emit('intervention:statusChanged',id,'statusChanged',{previousStatus:current?.status,status:'In corso'}); this.#emit('intervention:reopened',id,'reopened'); return saved; }
  getIntervention(id){return this.repository.getById(requiredId(id));}
  async listInterventions(filters={}) { let rows=await this.repository.list(); if(filters.date)rows=rows.filter(x=>x.date===filters.date); if(filters.status)rows=rows.filter(x=>x.status===filters.status); if(filters.operatorId)rows=rows.filter(x=>x.operatorId===filters.operatorId||x.assignedOperatorIds.includes(filters.operatorId)); return rows; }
  async #assignment(id,patch){const saved=await this.repository.update(requiredId(id),patch);this.#emit('intervention:assignmentChanged',id,'assignmentChanged');return saved;}
  #emit(name,id,changeType,extra={}){this.eventBus?.emit(name,{id:String(id),changeType,...extra});}
}
