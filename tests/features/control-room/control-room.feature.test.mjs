import assert from 'node:assert/strict';
import { ControlRoomFeature, CONTROL_ROOM_EVENTS } from '../../../src/features/control-room/control-room.feature.js';
class Container { constructor(){this.innerHTML='';this.textContent='';this.listeners=new Map()} addEventListener(n,f){this.listeners.set(n,f)} removeEventListener(n){this.listeners.delete(n)} querySelector(){return null} }
const events=[]; const handlers=new Map(); const bus={ on(name,fn){handlers.set(name,fn);return()=>handlers.delete(name)}, emit:(...args)=>events.push(args) };
const source={ id:'i1', date:new Date().toISOString().slice(0,10), teamId:'a', priority:'Urgente' }; let rejectWrite=false; const writes=[];
const context={ eventBus:bus, repositories:{ operators:{list:()=>[]}, teams:{list:()=>[{id:'a',name:'Squadra A'},{id:'b',name:'Squadra B'}]}, vehicles:{list:()=>[]} }, services:{ confirm:()=>true, interventions:{listInterventions:()=>[structuredClone(source)],assignTeam:async(...args)=>{writes.push(args);if(rejectWrite)throw new Error('write failed')}}, planning:{buildDay:()=>({schedules:{},config:{dayStartMinutes:360}}),classify:()=>({severity:'ok',availability:{state:'LIBERO',minutes:0}}),alternatives:()=>[{resource:{id:'team:b',name:'Squadra B'},arrival:500,travelMinutes:20,margin:5,impacted:[]}]}, logger:{warn(){},error(){}} } };
const container=new Container(), feature=new ControlRoomFeature(); await feature.mount(container,context); assert.equal(handlers.size,CONTROL_ROOM_EVENTS.length);
const click=container.listeners.get('click'); await click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'assign'}}:selector==='[data-intervention-id]'?{dataset:{interventionId:'i1'}}:{dataset:{resourceId:'team:b'}}}});
assert.deepEqual(writes,[['i1','b']]); assert.ok(events.some(([name])=>name==='controlRoom:suggestionApplied'));
rejectWrite=true; const before=events.length; await click({target:{closest:selector=>selector==='[data-action]'?{dataset:{action:'assign'}}:selector==='[data-intervention-id]'?{dataset:{interventionId:'i1'}}:{dataset:{resourceId:'team:b'}}}});
assert.equal(source.teamId,'a'); assert.equal(events.length,before); assert.match(container.innerHTML,/write failed/);
feature.unmount(); assert.equal(handlers.size,0); assert.equal(container.listeners.size,0);
for(let i=0;i<10;i++){await feature.mount(container,context);feature.unmount()} assert.equal(handlers.size,0);
const degraded=new ControlRoomFeature(); context.services.planning={buildDay(){throw new Error('planning')}}; await degraded.mount(container,context); assert.match(container.innerHTML,/Planning temporaneamente non disponibile/); degraded.unmount();
console.log('Control Room reassignment, failed write, planning degradation and 10x lifecycle tests passed');
