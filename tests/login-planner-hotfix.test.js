'use strict';
const assert=require('assert');
const fs=require('fs');
const vm=require('vm');
const P=require('../planning.js');
const html=fs.readFileSync(require.resolve('../index.html'),'utf8');

// Public API contract: every SFPlanning method invoked by index.html must exist.
assert.equal(typeof P.plannerResources,'function');
const calls=new Set([...html.matchAll(/(?:window\.)?SFPlanning\.([A-Za-z_$][\w$]*)\s*\(/g)].map(m=>m[1]));
for(const name of calls)assert.equal(typeof P[name],'function',`SFPlanning.${name} is not exported`);

// Dependency ordering and mixed-cache defensive contract.
assert(html.indexOf('<script src="planning.js"></script>')<html.indexOf('<script>'));
assert(html.includes("typeof window.SFPlanning!=='undefined'&&typeof window.SFPlanning.plannerResources==='function'"));
assert(html.includes("catch(e){console.error('Modulo applicativo non inizializzato:'"));

// Execute the actual readiness predicate with the planner missing, as in a stale PWA shell.
const predicate=html.match(/function planningReady\(\)\{([\s\S]*?)\n\}/);
assert(predicate,'planningReady not found');
const context={window:{SFPlanning:undefined}};
vm.runInNewContext(`function planningReady(){${predicate[1]}\n}; result=planningReady()`,context);
assert.equal(context.result,false);
context.window.SFPlanning={};
vm.runInNewContext('result=planningReady()',context);
assert.equal(context.result,false);
context.window.SFPlanning=P;
vm.runInNewContext('result=planningReady()',context);
assert.equal(context.result,true);

// v6.1.23 resource behaviour remains: team members are also individual resources.
const resources=P.plannerResources([{id:'a',name:'Squadra A',active:true,operatorIds:['m','l']}],[{id:'m',nome:'Mario',active:true},{id:'l',nome:'Luca',active:true}]);
assert.deepStrictEqual(resources.map(x=>x.id),['team:a','op:m','op:l']);
console.log('Login cloud disaccoppiato; fallback planner e contratto API SFPlanning verificati');
