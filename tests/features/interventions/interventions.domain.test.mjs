import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { normalizeIntervention } from '../../../src/shared/models/intervention.js';
import { InterventionsRepository } from '../../../src/services/repositories/interventions-repository.js';
import { InterventionsService } from '../../../src/services/interventions/interventions.service.js';
import { InterventionStatusService, INTERVENTION_STATUSES } from '../../../src/services/interventions/intervention-status.service.js';

const legacy={id:'A',client:'Acme',date:'2026-08-14',time:'08:30',status:'Programmato',operatorId:'7',assignment:{zone:'north'},coordinates:{lat:1,lng:2},reportData:{relation:'...',operatorSignature:'op',customerSignature:'customer'},unknownLegacy:{kept:true}};
const normalized=normalizeIntervention(legacy);
assert.equal(normalized.id,'A');assert.equal(normalized.clientName,'Acme');assert.equal(normalized.startTime,'08:30');assert.deepEqual(normalized.reportData,legacy.reportData);assert.deepEqual(normalized.assignment,legacy.assignment);assert.deepEqual(normalized.unknownLegacy,{kept:true});
normalized.reportData.relation='changed';assert.equal(legacy.reportData.relation,'...');

let store=[structuredClone(legacy)], writes=0;
const repository=new InterventionsRepository({list:()=>store,getById:id=>store.find(x=>x.id===id),create:row=>{writes++;store.push(structuredClone(row));return row},update:(id,patch)=>{writes++;const n=store.findIndex(x=>x.id===id);store[n]={...store[n],...patch,id};return store[n]},remove:id=>{writes++;store=store.filter(x=>x.id!==id);return{id}}});
const bus=new EventBus(),events=[];bus.on('intervention:created',e=>events.push(['created',writes,e]));bus.on('intervention:updated',e=>events.push(['updated',writes,e]));bus.on('intervention:assignmentChanged',e=>events.push(['assignment',writes,e]));
bus.on('intervention:updated',()=>{throw new Error('broken Agenda subscriber')});let later=false;bus.on('intervention:updated',()=>{later=true});
const service=new InterventionsService({repository,eventBus:bus,idFactory:()=> 'B',now:()=> '2026-08-14T10:00:00.000Z'});
const created=await service.createIntervention({client:'Beta',date:'2026-08-14',status:'Programmato'});assert.equal(created.id,'B');assert.deepEqual(events[0].slice(0,2),['created',1]);
await service.updateIntervention('A',{notes:'nuova nota'});const after=await service.getIntervention('A');assert.equal(after.id,'A');assert.deepEqual(after.reportData,legacy.reportData);assert.deepEqual(after.assignment,legacy.assignment);assert.equal(later,true);assert.deepEqual(events[1].slice(0,2),['updated',2]);
await service.assignOperator('A','9');assert.deepEqual((await service.getIntervention('A')).assignedOperatorIds,['9']);await service.assignTeam('A','T');assert.equal((await service.getIntervention('A')).teamId,'T');await service.assignOperators('A',[]);assert.equal((await service.getIntervention('A')).operatorId,'');
assert.deepEqual(INTERVENTION_STATUSES,['Programmato','Urgente','In corso','Terminato','Annullato']);const statuses=new InterventionStatusService();for(const from of INTERVENTION_STATUSES)for(const to of INTERVENTION_STATUSES)assert.equal(statuses.canTransition(from,to),true);assert.equal(statuses.isCompleted('terminato'),true);
const failed=[];const failureBus={emit:name=>failed.push(name)};const failureService=new InterventionsService({repository:{create:async()=>{throw new Error('write failed')}},eventBus:failureBus,idFactory:()=> 'C'});await assert.rejects(failureService.createIntervention({}),/write failed/);assert.deepEqual(failed,[]);
await service.deleteIntervention('B');assert.equal(await service.getIntervention('B'),undefined);assert.equal(store.some(x=>x.client==='Acme'),true);
console.log('Intervention model, repository, service, reportData, events, statuses and assignments passed');
