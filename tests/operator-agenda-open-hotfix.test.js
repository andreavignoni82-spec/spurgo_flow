'use strict';
const assert=require('assert');
const fs=require('fs');
const html=fs.readFileSync(require('path').join(__dirname,'..','index.html'),'utf8');

// The operator agenda emits the real intervention ID in both day and week blocks.
const agenda=html.slice(html.indexOf("let operatorAgendaView='day'"),html.indexOf('function backToOperatorJobs'));
assert.strictEqual((agenda.match(/data-intervention-id="\$\{esc\(i\.id\)\}"/g)||[]).length,2);
assert(!agenda.includes('onclick="openOperatorJob'));
assert(agenda.includes('bindOperatorAgendaOpening(host)'));

// One delegated handler covers nested time/client/status targets and touch-generated clicks.
const binding=html.slice(html.indexOf('function bindOperatorAgendaOpening'),html.indexOf('async function openOperatorIntervention'));
for(const token of ["addEventListener('click'","closest('[data-intervention-id]')",'block.dataset.interventionId','event.preventDefault()'])assert(binding.includes(token),token);

// The definitive opener normalizes the DOM string ID, accepts all assignment forms and does not mutate/save status.
assert.strictEqual((html.match(/async function openOperatorIntervention\s*\(/g)||[]).length,1);
const opener=html.slice(html.indexOf('async function openOperatorIntervention'),html.indexOf('function openOperatorJob'));
for(const token of ["String(x.id)===id",'assignedToOperator(source,operatorId)','populateReportForm(source)',"jobPicker').style.display='none'",'Intervento non trovato o non più disponibile.','[OperatorAgenda] intervention not found:','Intervento non assegnato a questo operatore.'])assert(opener.includes(token),token);
for(const forbidden of [/\.status\s*=(?!=)/,/actualStart\s*=(?!=)/,/saveV6\s*\(/,/saveIntervention\s*\(/,/\.push\s*\(/])assert(!forbidden.test(opener),forbidden);
assert(html.includes('function openOperatorJob(id){return openOperatorIntervention(id)}'));

// Predicate regression coverage: direct, assignedOperatorIds, team and completed jobs remain openable.
const assigned=(job,operatorId,teams)=>job.operatorId===operatorId||job.assignedOperatorIds?.includes(operatorId)||teams.find(t=>t.id===job.teamId)?.operatorIds.includes(operatorId);
const teams=[{id:'T1',operatorIds:['OP1']}];
for(const job of [
 {id:101,operatorId:'OP1',assignedOperatorIds:[],teamId:'',status:'Programmato'},
 {id:102,operatorId:'',assignedOperatorIds:['OP1'],teamId:'',status:'Programmato'},
 {id:103,operatorId:'',assignedOperatorIds:[],teamId:'T1',status:'Programmato'},
 {id:104,operatorId:'OP1',assignedOperatorIds:[],teamId:'',status:'Terminato'}
])assert(assigned(job,'OP1',teams),job.id);
assert(!assigned({id:105,operatorId:'OP2',assignedOperatorIds:[],teamId:''},'OP1',teams));
console.log('v6.1.23.6: apertura agenda operatore diretta, delegata e senza mutazioni verificata');
