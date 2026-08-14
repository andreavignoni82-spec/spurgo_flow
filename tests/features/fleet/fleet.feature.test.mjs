import assert from 'node:assert/strict';
import { EventBus } from '../../../src/core/event-bus.js';
import { FleetFeature } from '../../../src/features/fleet/fleet.feature.js';
class Container { listeners=new Map(); innerHTML=''; textContent=''; addEventListener(n,f){(this.listeners.get(n)??this.listeners.set(n,new Set()).get(n)).add(f)} removeEventListener(n,f){this.listeners.get(n)?.delete(f)} emit(n,target){for(const f of this.listeners.get(n)??[])f({target,preventDefault(){}})} }
globalThis.FormData=class{constructor(form){this.values=form.values}entries(){return Object.entries(this.values)}}; globalThis.confirm=()=>true;
const tick=()=>new Promise(resolve=>setTimeout(resolve,0)); const bus=new EventBus(); const events=[];
for(const name of ['vehicle:created','vehicle:updated','vehicle:deleted'])bus.on(name,payload=>events.push([name,payload]));
let creates=0, updates=0, removes=0; const repository={list:async()=>[{id:'a',name:'Autobotte',status:'Operativa'}],create:async data=>{creates++;await tick();return{...data,id:'new'}},update:async(id,data)=>{updates++;return{...data,id}},remove:async id=>{removes++;return{id}}};
const container=new Container(), feature=new FleetFeature(); await feature.mount(container,{eventBus:bus,repositories:{vehicles:repository}}); assert.match(container.innerHTML,/Autobotte/);
const counts=()=>Object.fromEntries([...container.listeners].map(([k,v])=>[k,v.size])); const initial=counts(); for(let i=0;i<10;i++)await feature.mount(container,{eventBus:bus,repositories:{vehicles:repository}}); assert.deepEqual(counts(),initial);
const action=(name,id)=>({dataset:{action:name},closest(selector){if(selector==='[data-action]')return this;if(selector==='[data-vehicle-id]'&&id)return{dataset:{vehicleId:id}};return null}});
container.emit('click',action('new')); const form={values:{name:'Beta',code:'B',type:'Autobotte',plate:'ZA',capacity:'8 m³',status:'Operativa',hours:'1',nextMaintenance:'2 h'},matches:s=>s==='[data-role="form"]'}; container.emit('submit',form);container.emit('submit',form);await tick();await tick();assert.equal(creates,1);assert.deepEqual(events[0],['vehicle:created',{id:'new'}]);
container.emit('click',action('edit','new'));container.emit('submit',form);await tick();assert.equal(updates,1);container.emit('click',action('delete','new'));await tick();assert.equal(removes,1);assert.equal(events.at(-1)[0],'vehicle:deleted');
await feature.refresh({vehicles:[]});assert.match(container.innerHTML,/Nessun mezzo/);feature.unmount();assert.ok([...container.listeners.values()].every(set=>set.size===0));
const failed=new Container();await new FleetFeature().mount(failed,{repositories:{vehicles:{list:async()=>{throw new Error('offline')}}}});assert.equal(failed.textContent,'Modulo Mezzi temporaneamente non disponibile');
const saveFailed=new Container(), failing=new FleetFeature();await failing.mount(saveFailed,{repositories:{vehicles:{list:async()=>[],create:async()=>{throw new Error('offline')}}}});saveFailed.emit('click',action('new'));saveFailed.emit('submit',form);await tick();assert.match(saveFailed.innerHTML,/Mezzo non salvato: offline/);assert.match(saveFailed.innerHTML,/value="Beta"/);
console.log('Fleet empty/list CRUD, failure, refresh, double save and lifecycle cleanup passed');
