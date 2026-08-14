import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';

const root = new URL('../../', import.meta.url).pathname;
async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map(entry => entry.isDirectory()
    ? files(path.join(dir, entry.name))
    : [path.join(dir, entry.name)]))).flat();
}
const js = async dir => (await files(path.join(root, dir))).filter(file => file.endsWith('.js'));
const sources = async dir => Promise.all((await js(dir)).map(async file => [file, await readFile(file, 'utf8')]));

for (const [file, source] of await sources('src/features')) {
  assert.doesNotMatch(source, /(?:from\s*|import\s*\()["'][^"']*(?:firebase|features\/)[^"']*["']/, file);
  assert.doesNotMatch(source, /\b(?:sfOfficeInterventions|sfOperators|sfTeams)\b/, file);
}
for (const [file, source] of await sources('src/features/dashboard')) {
  assert.doesNotMatch(source, /(?:from\s*|import\s*\()["'][^"']*features\/(?!dashboard(?:\/|$))[^"']*["']/, file);
  assert.doesNotMatch(source, /\bfirebase\b|\blocalStorage\b|\bwindow\.sf\w*|\b(?:sfOfficeInterventions|sfOperators|sfTeams)\b/i, file);
}
for (const [file, source] of await sources('src/services/repositories')) {
  assert.doesNotMatch(source, /(?:shared\/ui|features\/|\bdocument\b|querySelector|innerHTML)/, file);
}
for (const [file, source] of await sources('src/services')) {
  assert.doesNotMatch(source, /\b(?:document|HTMLElement)\b|querySelector|innerHTML|appendChild/, file);
}
console.log('Architectural dependency rules passed');
