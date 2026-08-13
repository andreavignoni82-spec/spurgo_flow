const assert=require('assert');
const fs=require('fs');

const sync=fs.readFileSync('firebase-sync.js','utf8');
const html=fs.readFileSync('index.html','utf8');
const rules=fs.readFileSync('firestore.rules','utf8');

assert.match(rules,/match \/resourceAvailability\/\{id\}[\s\S]*?allow read, write: if isOffice\(\)/);
assert.match(sync,/seedOfficeIfEmpty\(\['resourceAvailability'\]\)/);
assert.match(sync,/handleModuleError\('ResourceAvailability',e\)/);
assert.match(sync,/error\?\.code==='permission-denied'/);
const primaryBatch=sync.match(/Promise\.all\(\[([\s\S]*?)\]\);/)[1];
assert.doesNotMatch(primaryBatch,/resourceAvailability/);
assert.match(html,/sfResourceAvailability=\[\]/);
assert.match(html,/Disponibilità giornaliera non sincronizzata · tutte disponibili/);
assert.match(html,/await startCloudData\(info\)/);
const dataStartup=html.match(/async function startCloudData\(info\)\{([\s\S]*?)\n\}/)[1];
assert.doesNotMatch(dataStartup,/alert\(/);

console.log('v6.1.23.2: regola minima e isolamento Resource Availability verificati');
