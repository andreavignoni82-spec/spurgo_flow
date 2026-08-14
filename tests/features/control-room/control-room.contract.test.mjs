import assert from 'node:assert/strict'; import fs from 'node:fs';
const root=new URL('../../../src/features/control-room/',import.meta.url); const read=name=>fs.readFileSync(new URL(name,root),'utf8');
const feature=read('control-room.feature.js'),view=read('control-room.view.js'),model=read('control-room.model.js'),timeline=read('control-room.timeline.js');
assert.doesNotMatch(feature,/firebase|leaflet|features\/(agenda|interventions|people|dashboard|reports)|AgendaFeature|InterventionsFeature|PeopleFeature|DashboardFeature|ReportsFeature/i);
assert.doesNotMatch(view,/repositories|firebase|leaflet/i); assert.doesNotMatch(model,/document|querySelector|innerHTML|firebase/i); assert.doesNotMatch(timeline,/firebase|repositories|document/i);
assert.match(feature,/services\.interventions\.assignTeam/); assert.doesNotMatch(feature,/repositories\.interventions|agendaFeature/i);
console.log('Control Room dependency and write-boundary contract tests passed');
