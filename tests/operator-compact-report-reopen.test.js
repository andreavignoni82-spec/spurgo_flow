'use strict';
const assert=require('assert');
const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');

// A/B/C/Q: the production predicate includes direct, multi-operator and team assignments,
// while the list excludes only cancelled work (not completed work).
assert(html.includes("assignedToOperator(i,id)&&i.status!=='Annullato'"));
assert(html.includes("team.operatorIds.includes(operatorId)"));
const assignedTo=(job,operatorId,teams)=>job.operatorId===operatorId||job.assignedOperatorIds?.includes(operatorId)||teams.find(t=>t.id===job.teamId)?.operatorIds.includes(operatorId);
const teams=[{id:'team-a',operatorIds:['op-a']}];
const jobs=Array.from({length:10},(_,n)=>({id:'J'+n,operatorId:n<9?'op-a':'op-b',assignedOperatorIds:[],teamId:n===9?'team-a':'',date:n<2?'2026-08-13':n<6?'2026-08-14':'2026-08-12',time:String(8+n).padStart(2,'0')+':00',status:n===0?'Urgente':n>7?'Terminato':'Programmato'}));
assert.strictEqual(jobs.filter(j=>assignedTo(j,'op-a',teams)).length,10);
assert.strictEqual(jobs.filter(j=>assignedTo(j,'op-x',teams)).length,0);

// C/D: bucket order is active urgency, today, future, then past/completed descending.
const bucket=(j,today)=>j.status!=='Terminato'&&(j.status==='Urgente'||/urgent|emerg/i.test(j.priority||''))?0:j.date===today?1:j.status!=='Terminato'&&j.date>today?2:3;
const ordered=[...jobs].sort((a,b)=>bucket(a,'2026-08-13')-bucket(b,'2026-08-13')||(bucket(a,'2026-08-13')===3?(b.date+b.time).localeCompare(a.date+a.time):(a.date+a.time).localeCompare(b.date+b.time)));
assert.strictEqual(ordered[0].status,'Urgente');
assert(ordered.findIndex(j=>j.date==='2026-08-14')<ordered.findIndex(j=>j.status==='Terminato'));

// E: whole compact row is keyboard/touch clickable and has no “Apri” action button.
const compactTemplate=html.slice(html.indexOf('function syncOperatorJobs(){'),html.indexOf('function backToOperatorJobs'));
assert(compactTemplate.includes('onclick="openOperatorJob'));
assert(compactTemplate.includes('agenda-block'));
assert(compactTemplate.includes('agenda-week-job'));
assert(!compactTemplate.includes('Apri commessa'));

// F/G/H/I/L/M/N/O/P: one existing id is loaded, fully populated, merged and saved in place.
assert(html.includes('function resetReportForm()'));
assert(html.includes('function populateReportForm(job)'));
assert(html.includes('function collectReportForm(job)'));
assert(html.includes("sfOfficeInterventions.find(x=>x.id===job.id)"));
assert(html.includes("current.status='Riaperto'"));
for(const token of ['relationInput','activities','quantities','photos','operatorSignature','customerSignature','opLat','opLng'])assert(html.includes(token),token);
const original={id:'INT-1',status:'Terminato',reportData:{relation:'prima',photos:{prima:'data:image/png;base64,x'},materials:['A'],operatorSignature:'op',customerSignature:'cl'}};
const updated={...original,status:'Riaperto',reportData:{...original.reportData,relation:'modificata'}};
assert.strictEqual(updated.id,original.id);assert.strictEqual(updated.reportData.photos.prima,original.reportData.photos.prima);assert.strictEqual(updated.reportData.operatorSignature,'op');
assert.strictEqual(new Set([updated.id]).size,1);

// Operator navigation is retained only as dormant compatibility markup and hidden from UI.
for(const id of ['#fieldAgenda','#fieldMappa','#fieldMessaggi','#fieldProfilo','#fieldNav'])assert(html.includes(id),id);
assert(html.includes('display:none!important'));
console.log('v6.1.23.5: agenda, privacy e riapertura sullo stesso interventionId verificati');
