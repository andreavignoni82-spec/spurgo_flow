import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { AgendaFeature } from '../../../src/features/agenda/agenda.feature.js';
class Container {listeners=new Map();innerHTML='';textContent='';addEventListener(n,f){(this.listeners.get(n)??this.listeners.set(n,new Set()).get(n)).add(f)}removeEventListener(n,f){this.listeners.get(n)?.delete(f)}emit(n,target){for(const f of this.listeners.get(n)??[])f({target})}}
const tick=()=>new Promise(resolve=>setTimeout(resolve,0));let reads=0;const record=Object.freeze({id:'canonical',date:new Date().toISOString().slice(0,10),time:'08:00',estimatedMinutes:60,client:'Acme',operatorId:'op',assignedOperatorIds:['op']});
const service={listInterventions:async()=>{reads++;return[record]}};const repos={operators:{list:async()=>[{id:'op',name:'Ada'}]},teams:{list:async()=>[]}};const bus=new EventBus(),container=new Container(),feature=new AgendaFeature();let opened;bus.on('intervention:openRequested',value=>opened=value);
await feature.mount(container,{eventBus:bus,services:{interventions:service},repositories:repos});assert.match(container.innerHTML,/data-intervention-id="canonical"/);const before=structuredClone(record);
const block={dataset:{interventionId:'canonical'},closest:s=>s==='[data-intervention-id]'?block:null};container.emit('click',block);assert.deepEqual(opened,{id:'canonical'});assert.deepEqual(record,before);
const listenerCounts=()=>Object.fromEntries([...container.listeners].map(([key,set])=>[key,set.size]));const initial=listenerCounts();for(let i=0;i<10;i++)await feature.mount(container,{eventBus:bus,services:{interventions:service},repositories:repos});assert.deepEqual(listenerCounts(),initial);
const current=reads;bus.emit('vehicle:updated',{id:'v'});await tick();assert.equal(reads,current);bus.emit('intervention:updated',{id:'canonical'});await tick();assert.equal(reads,current+1);bus.emit('operator:statusChanged',{id:'op'});await tick();assert.equal(reads,current+2);
feature.unmount();assert.ok([...container.listeners.values()].every(set=>set.size===0));const afterUnmount=reads;bus.emit('intervention:updated',{id:'canonical'});await tick();assert.equal(reads,afterUnmount);
const failed=new Container();await new AgendaFeature().mount(failed,{eventBus:new EventBus(),services:{interventions:{listInterventions:async()=>{throw new Error('offline')}}},repositories:repos});assert.equal(failed.textContent,'Modulo Agenda temporaneamente non disponibile');
console.log('Agenda click/read-only/events/targeted refresh/error/lifecycle tests passed');
