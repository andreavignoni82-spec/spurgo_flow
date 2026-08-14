import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const read=file=>readFile(new URL(`../../../${file}`,import.meta.url),'utf8');
const feature=await read('src/features/agenda/agenda.feature.js'),view=await read('src/features/agenda/agenda.view.js'),model=await read('src/features/agenda/agenda.model.js'),timeline=await read('src/features/agenda/agenda.timeline.js');
assert.doesNotMatch(feature,/firebase|features\/(dashboard|clients|fleet|people|interventions|control-room)|openInterventionModal|localStorage|sessionStorage/i);assert.doesNotMatch(view,/repositories|firebase/i);assert.doesNotMatch(model,/document|querySelector|innerHTML|firebase|localStorage/i);assert.doesNotMatch(timeline,/document|firebase|localStorage|repositories/i);
for(const selector of ['button','table','h1','input','.card'])assert.doesNotMatch(await read('src/features/agenda/agenda.css'),new RegExp(`(^|})\\s*${selector.replace('.','\\.')}(?=[,{])`));
console.log('Agenda architectural and CSS scope contracts passed');
