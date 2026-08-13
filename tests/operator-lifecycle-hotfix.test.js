const assert=require('assert');
const fs=require('fs');
const vm=require('vm');

const html=fs.readFileSync('index.html','utf8');
const sync=fs.readFileSync('firebase-sync.js','utf8');
const planning=fs.readFileSync('planning.js','utf8');

// Lifecycle UI and light migration: records remain, the normal action only flips active.
assert.match(html,/loadJson\('sf_operators'[\s\S]*active:o\.active!==false/);
assert.match(html,/DISATTIVA/);
assert.match(html,/RIATTIVA/);
assert.match(html,/ELIMINA DEFINITIVAMENTE ACCOUNT/);
assert.match(html,/o\.active=active/);
assert.doesNotMatch(html,/sfTeams\.forEach\(t=>t\.operatorIds=.*filter\(x=>x!==id\)/);
assert.doesNotMatch(html,/sfOfficeInterventions\.forEach\(i=>\{if\(i\.operatorId===id\)/);

// Cloud identity is reused on reactivation; no provisioning is called by toggleOperator.
const toggle=html.slice(html.indexOf('async function toggleOperator'),html.indexOf('async function deleteOperator'));
assert.match(toggle,/setOperatorActive\(o,active\)/);
assert.doesNotMatch(toggle,/provisionOperator|password|cloudUid\s*=|cloudEmail\s*=/);
assert.match(sync,/setDoc\(doc\(db,'operators',op\.id\),\{active\},\{merge:true\}\)/);
assert.match(sync,/setDoc\(profileRef\(op\.cloudUid\),\{active\},\{merge:true\}\)/);

// Disabled cloud login signs out and returns the required controlled message.
assert.match(sync,/operator\.active===false\)[\s\S]*await signOut\(auth\)[\s\S]*Account operatore disattivato\. Contattare l'Ufficio\./);

// Existing orphan Auth is never auto-linked and gets actionable, nontechnical UI copy.
assert.match(sync,/auth\/email-already-in-use/);
assert.match(html,/Esiste già un account cloud con questo username[\s\S]*Eliminalo da Firebase Authentication oppure utilizza un username diverso\./);

// Client SDK definitive deletion cannot report partial success or erase operators/{id}.
const definitive=sync.slice(sync.indexOf('async function deleteOperatorAccount'),sync.indexOf('\nif(configured)'));
assert.match(definitive,/SF_ADMIN_SDK_REQUIRED/);
assert.match(definitive,/rimuovere \$\{email\} da Firebase Authentication/);
assert.doesNotMatch(definitive,/deleteDoc|deleteUser/);

// Teams with no active members are not planner resources; their historic member IDs survive.
const sandbox={module:{exports:{}},exports:{}};vm.runInNewContext(planning,sandbox);
const P=sandbox.module.exports;
const operators=[{id:'simone',nome:'Simone',active:false},{id:'anna',nome:'Anna',active:true}];
let resources=P.plannerResources([{id:'old',name:'Storica',operatorIds:['simone']}],operators);
assert.strictEqual(resources.length,1); // Anna only; Storica and Simone excluded.
resources=P.plannerResources([{id:'mixed',name:'Mista',operatorIds:['simone','anna']}],operators);
assert(resources.some(r=>r.id==='team:mixed'));
assert.deepStrictEqual(operators.map(o=>o.id),['simone','anna']);

console.log('v6.1.23.8: ciclo vita operatori, account orfani e squadre verificati');
