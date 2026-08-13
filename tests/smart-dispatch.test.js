'use strict';
const assert=require('assert');
const P=require('../planning.js');
const date='2026-08-13', resources=[{id:'op:a',name:'Mario'},{id:'team:b',name:'Squadra B'}];
const options=(jobs=[],extra={})=>({resources,jobs,resourceId:j=>j.resourceId,startDate:date,config:{travelBufferMinutes:0,averageSpeedKmh:100000,missingCoordinatesTravelMinutes:0},...extra});
const draft=(minutes=60,extra={})=>({address:'Via Roma',lat:45,lng:9,estimatedMinutes:minutes,date,...extra});
let r=P.findBestSlots(draft(),options());
assert(r.suggestions.some(s=>s.start>=420&&s.end<=720)); // A
assert(r.suggestions.every(s=>s.end<=720||s.start>=780)); // B
assert(r.suggestions.some(s=>s.start>=780&&s.end<=1020)); // C
assert(r.suggestions.every(s=>s.end<=1020)); // D
r=P.findBestSlots(draft(),options([], {resourceAvailability:(d,id)=>id!=='op:a'}));assert(r.suggestions.every(s=>s.resource.id!=='op:a')); // E
r=P.findBestSlots(draft(),options([], {resourceAvailability:(d,id)=>id!=='team:b'}));assert(r.suggestions.every(s=>s.resource.id!=='team:b')); // F
r=P.findBestSlots(draft(),options([], {resourceAvailability:()=>true}));assert(new Set(r.suggestions.map(s=>s.resource.id)).size===2); // G
assert(P.findBestSlots(draft(60),options()).suggestions.every(s=>s.durationMinutes===60)); // H
assert(P.findBestSlots(draft(120),options()).suggestions.every(s=>s.durationMinutes===120)); // I
assert(P.findBestSlots(draft(60,{preferredRange:{from:420,to:720}}),options()).suggestions.every(s=>s.start>=420&&s.end<=720)); // L
assert(P.findBestSlots(draft(60,{preferredRange:{from:780,to:1020}}),options()).suggestions.every(s=>s.start>=780&&s.end<=1020)); // M
const full=[];for(const id of resources.map(x=>x.id))for(const [time,dur] of [['07:00',300],['13:00',240]])full.push({id:id+time,date,time,estimatedMinutes:dur,status:'Programmato',resourceId:id,lat:45,lng:9});
r=P.findBestSlots(draft(),options(full,{onlyThisDay:true}));assert(!r.suggestions.some(s=>s.classification==='SICURO')); // N
r=P.findBestSlots({...draft(),date:''},options(full));assert(r.suggestions.some(s=>s.date>date)); // O
r=P.findBestSlots(draft(60,{priority:'Urgente',time:'16:30',fixedTime:true}),options());assert(r.suggestions.every(s=>s.urgent));assert(r.suggestions.some(s=>s.operationalException)); // P
r=P.findBestSlots(draft(),options([],{resourceAvailability:(d,id)=>id!=='op:a'}));assert(r.suggestions.every(s=>s.resource.id!=='op:a')); // Q
const travelJob={id:'x',date,time:'10:00',estimatedMinutes:60,status:'Programmato',resourceId:'op:a',lat:46,lng:10};r=P.findBestSlots(draft(60,{time:'09:30',fixedTime:true}),options([travelJob]));assert(!r.suggestions.some(s=>s.resource.id==='op:a'&&s.classification!=='SCONSIGLIATO')); // R
const immutable=draft();P.findBestSlots(immutable,options());assert.strictEqual(immutable.time,undefined); // S
let active=false;r=P.findBestSlots(draft(),options([],{resourceAvailability:(d,id)=>id!=='op:a'||active}));assert(r.suggestions.every(s=>s.resource.id!=='op:a'));active=true;r=P.findBestSlots(draft(),options([],{resourceAvailability:(d,id)=>id!=='op:a'||active}));assert(r.suggestions.some(s=>s.resource.id==='op:a')); // T
assert.deepStrictEqual(P.WORKDAY,{morningStart:'07:00',morningEnd:'12:00',afternoonStart:'13:00',afternoonEnd:'17:00'});
assert.deepStrictEqual(P.SMART_SLOT_CONFIG,{minimumSafeBuffer:20,minimumTightBuffer:10,maxSuggestions:5,searchDays:7});
console.log('Smart Dispatch v6.1.23: scenari A–T superati');
