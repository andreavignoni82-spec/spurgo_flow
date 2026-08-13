'use strict';
const assert=require('assert');
const P=require('../planning.js');

const date='2026-08-13';
const operators=Array.from({length:5},(_,i)=>({id:String(i+1),nome:['Mario','Luca','Paolo','Anna','Sara'][i],active:true}));
const teams=[{id:'a',name:'Squadra A',active:true,operatorIds:['1','2']},{id:'b',name:'Squadra B',active:true,operatorIds:['3','4']}];
const resources=P.plannerResources(teams,operators);
assert.deepStrictEqual(resources.map(r=>r.id),['team:a','team:b','op:1','op:2','op:3','op:4','op:5']); // A, B
assert(resources.every(r=>r.available)); // C
assert(resources.filter(r=>r.id!=='op:1').some(r=>r.id==='team:a')); // D
assert(resources.filter(r=>r.id!=='team:a').some(r=>r.id==='op:1')); // E

const config={travelBufferMinutes:0,averageSpeedKmh:100000,missingCoordinatesTravelMinutes:0,minimumBufferMinutes:10,slotStepMinutes:5};
const draft={address:'Via Roma',lat:45,lng:9,estimatedMinutes:60};
const options=(jobs=[],extra={})=>({resources:[resources[0]],jobs,resourceId:j=>j.resourceId,startDate:date,now:new Date('2026-08-13T15:30:00'),config,...extra});
let result=P.findBestSlots(draft,options());
assert(result.suggestions.every(s=>s.date!==date||s.start>=940)); // F: 15:30 + buffer, arrotondato

const full=[['07:00',300],['13:00',240]].map(([time,estimatedMinutes],i)=>({id:'j'+i,date,time,estimatedMinutes,status:'Programmato',resourceId:'team:a',lat:45,lng:9}));
result=P.findBestSlots(draft,options(full));
assert(result.suggestions.length&&result.suggestions[0].date==='2026-08-14'); // G
assert.strictEqual(result.suggestions[0].time,'07:00');
result=P.findBestSlots(draft,options(full,{onlyThisDay:true}));
assert.strictEqual(result.suggestions.length,0);assert.strictEqual(result.error,'Nessuno slot disponibile nel giorno selezionato'); // H

result=P.findBestSlots(draft,{...options(),now:new Date('2026-08-12T10:00:00'),onlyThisDay:true});
assert(result.suggestions.some(s=>s.start>=420&&s.end<=720)); // I
assert(result.suggestions.some(s=>s.start>=780&&s.end<=1020)); // L
assert(result.suggestions.every(s=>s.end<=720||s.start>=780)); // M
assert(result.suggestions.every(s=>s.end<=1020)); // N

assert.deepStrictEqual(P.assignmentForResource('op:1',teams),{teamId:'',operatorIds:['1']}); // O
assert.deepStrictEqual(P.assignmentForResource('team:a',teams),{teamId:'a',operatorIds:['1','2']}); // P
result=P.findBestSlots(draft,options([],{resourceAvailability:()=>false}));
assert.strictEqual(result.suggestions.length,0);assert.strictEqual(result.error,'Tutte le risorse risultano non disponibili'); // Q

console.log('v6.1.23: 5 operatori + 2 squadre = 7 risorse; slot esempio 14/08/2026 07:00');
