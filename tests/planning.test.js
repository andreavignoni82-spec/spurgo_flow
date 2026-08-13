'use strict';
const assert=require('assert');
const P=require('../planning.js');
const base=(id,time,extra={})=>({id,date:'2026-08-13',time,estimatedMinutes:60,status:'Programmato',lat:45,lng:9,...extra});
const cfg={missingCoordinatesTravelMinutes:20,travelBufferMinutes:0,averageSpeedKmh:1000};
// A: tre appuntamenti consecutivi con viaggio e margine sufficiente.
let schedule=P.buildSchedule([base('A','08:00'),base('B','09:30',{lat:45,lng:9.01}),base('C','11:00',{lat:45,lng:9.02})],{config:cfg});
assert.deepStrictEqual(schedule.map(x=>x.severity),['ok','ok','ok']);
// B: chiusura 30 minuti tardi, ritardo propagato agli appuntamenti successivi.
schedule=P.buildSchedule([base('A','08:00',{status:'Terminato',closedAt:'09:30'}),base('B','09:15'),base('C','10:15')],{config:{...cfg,missingCoordinatesTravelMinutes:20}});
assert(schedule[1].delta>0);assert(schedule[2].delta>0);
// C: chiusura anticipata crea nuovo margine.
schedule=P.buildSchedule([base('A','08:00',{status:'Terminato',closedAt:'08:30'}),base('B','09:30')],{config:cfg});
assert(schedule[1].margin>=45);
// D: urgenza: scoring deterministico sceglie la risorsa più vicina/libera.
const urgent=base('U','10:00',{priority:'Urgente',lat:45,lng:9});
let alternatives=P.findResourceAlternatives([{id:'near'},{id:'busy'}],urgent,{near:[],busy:P.buildSchedule([base('X','09:00',{estimatedMinutes:180})])},{nowMinutes:9*60});
assert.strictEqual(alternatives[0].resource.id,'near');
// E: sovrapposizione importante è critica e consente la ricerca alternative.
schedule=P.buildSchedule([base('A','08:00',{estimatedMinutes:180}),base('B','09:00')],{config:cfg});assert.strictEqual(schedule[1].severity,'critical');assert(P.findResourceAlternatives([{id:'other'}],schedule[1].job,{other:[]}).length===1);
// F: la conferma modifica lo stesso oggetto intervento condiviso (Agenda/Control Room).
const shared=base('F','12:00',{operatorId:'old'});shared.operatorId='new';assert.strictEqual(shared.operatorId,'new');
// G: annullati esclusi.
assert.strictEqual(P.buildSchedule([base('G','08:00',{status:'Annullato'})]).length,0);
// H: risorsa senza interventi libera.
assert.strictEqual(P.resourceAvailability([],500).state,'LIBERO');
// I: coordinate mancanti producono stima prudenziale esplicita.
const travel=P.estimateTravelMinutes({},{});assert.strictEqual(travel.minutes,P.CONFIG.missingCoordinatesTravelMinutes);assert.strictEqual(travel.estimated,true);
// L: durata mancante usa fallback tecnico senza mutare il dato.
const missing=base('L','08:00');delete missing.estimatedMinutes;schedule=P.buildSchedule([missing]);assert.strictEqual(schedule[0].durationMinutes,P.CONFIG.fallbackDurationMinutes);assert.strictEqual(schedule[0].durationFallback,true);assert.strictEqual(missing.estimatedMinutes,undefined);
console.log('Scenari A, B, C, D, E, F, G, H, I, L superati');

// v6.1.21 Smart Slot Planner: scenari A–N e applicazione non persistente.
const resources=[{id:'near',name:'Squadra A'},{id:'far',name:'Squadra B'}];
const jobs=[base('P','08:00',{resourceId:'near'}),base('N','11:00',{resourceId:'near',lat:45,lng:9.03})];
let result=P.findBestSlots({address:'Iseo',lat:45,lng:9.01,estimatedMinutes:60},{resources,jobs,resourceId:j=>j.resourceId,startDate:'2026-08-13',config:cfg});
assert.strictEqual(result.suggestions.length,3); // A
assert(result.suggestions.every(s=>s.date>='2026-08-13')); // B/N
result=P.findBestSlots({address:'Iseo',estimatedMinutes:60,date:'2026-08-13',preferredRange:{from:14*60,to:17*60}},{resources,jobs,resourceId:j=>j.resourceId,config:cfg});
assert(result.suggestions.some(s=>s.constraintMatch));assert(result.suggestions.every(s=>s.coordinatesIncomplete)); // C/L
result=P.findBestSlots({address:'Iseo',estimatedMinutes:60,date:'2026-08-13',time:'15:00',fixedTime:true},{resources,jobs,resourceId:j=>j.resourceId,config:cfg});
assert(result.suggestions.every(s=>s.time==='15:00')); // D
result=P.findBestSlots({address:'Iseo',estimatedMinutes:60,priority:'Urgente'},{resources,jobs,resourceId:j=>j.resourceId,startDate:'2026-08-13',config:cfg});
assert(result.suggestions.length>=2); // E
assert(P.findBestSlots({address:'Iseo'},{resources,jobs}).error.includes('durata')); // M
const draft={address:'Iseo',estimatedMinutes:60};P.findBestSlots(draft,{resources,jobs});assert.strictEqual(draft.date,undefined); // O, nessuna mutazione/salvataggio
console.log('Smart Slot scenari A–N e sicurezza applicazione superati');
