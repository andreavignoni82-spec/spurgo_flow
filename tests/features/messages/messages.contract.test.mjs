import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const load = path => readFile(new URL(`../../../${path}`, import.meta.url), 'utf8');
const [feature, view, model, repository] = await Promise.all([load('src/features/messages/messages.feature.js'), load('src/features/messages/messages.view.js'), load('src/features/messages/messages.model.js'), load('src/services/repositories/messages-repository.js')]);
assert.doesNotMatch(feature, /firebase|features\/(?!messages)/i);
assert.doesNotMatch(feature, /\b(?:sfMessages|sfOperators|sfTeams|localStorage|document)\b/);
assert.doesNotMatch(view, /repository|firebase/i);
assert.doesNotMatch(model, /\b(?:document|window|localStorage|firebase)\b/i);
assert.doesNotMatch(repository, /\b(?:document|innerHTML|querySelector)\b/);
assert.match(repository, /extends RepositoryContract/); // list() is inherited from the base repository contract.
for (const api of ['getById', 'create', 'update', 'markRead']) assert.match(repository, new RegExp(`\\b${api}\\(`));
console.log('Messages feature/view/model/repository dependency contracts passed');
