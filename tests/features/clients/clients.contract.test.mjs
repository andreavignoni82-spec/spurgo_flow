import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
const root = new URL('../../../', import.meta.url);
const source = name => readFile(new URL(`src/features/clients/${name}`, root), 'utf8');
const [feature, view, model, repository] = await Promise.all([
  source('clients.feature.js'), source('clients.view.js'), source('clients.model.js'),
  readFile(new URL('src/services/repositories/clients-repository.js', root), 'utf8')
]);
assert.doesNotMatch(feature, /firebase|features\/(?!clients)/i);
assert.doesNotMatch(feature, /\b(?:window|sfClients|renderDashboard|refreshDashboard)\b/);
assert.doesNotMatch(view, /repository|firebase/i);
assert.doesNotMatch(model, /\b(?:document|window|localStorage|querySelector|innerHTML)\b/);
assert.doesNotMatch(repository, /\b(?:document|window|HTMLElement|innerHTML)\b/);
console.log('Clients architectural contracts passed');
