import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { parseHTML } from 'linkedom';
import { bootstrap } from '../../src/app/bootstrap.js';
import { createEnvironment, ConfigurationError } from '../../src/config/environment.js';

const validFirebase = Object.freeze({ apiKey: 'demo-test-only', authDomain: 'localhost', projectId: 'spurgoflow-test', appId: '1:test:web:test', host: '127.0.0.1', firestorePort: 8080, authPort: 9099, useEmulator: true });
function dom() { const parsed = parseHTML('<div id="app"></div>'); globalThis.document = parsed.document; globalThis.window = parsed.window; return parsed.document.querySelector('#app'); }

test('memory bootstrap is autonomous, complete, and performs zero network access', async () => {
  const previousFetch = globalThis.fetch; let requests = 0;
  globalThis.fetch = () => { requests += 1; throw new Error('Network is blocked by test'); };
  try {
    const application = await bootstrap(dom(), { environment: createEnvironment({ dataDriver: 'memory', firebase: { projectId: 'invalid' } }) });
    assert.equal(application.environment.driver, 'memory');
    assert.deepEqual(application.context.services.backendHealth.status(), { data: 'connected', auth: 'local/noop', realtime: 'local/noop' });
    for (const key of ['clients','vehicles','operators','teams','interventions','reports','messages','auth']) assert.ok(application.context.services[key], `services.${key}`);
    for (const key of ['clients','vehicles','operators','teams','interventions','reports','messages']) assert.ok(application.context.repositories[key], `repositories.${key}`);
    assert.equal(typeof application.context.realtime.subscribeCollection('clients', () => {}), 'function');
    assert.equal(typeof application.context.realtime.subscribeEntity('clients', 'id', () => {}), 'function');
    assert.equal(requests, 0); await application.close();
  } finally { globalThis.fetch = previousFetch; }
});

test('driver-aware configuration matrix supports production and emulator Firebase', () => {
  assert.equal(createEnvironment({ dataDriver: 'memory' }).firebase, null, 'A: memory without Firebase');
  assert.equal(createEnvironment({ dataDriver: 'memory', firebase: { apiKey: '', projectId: 'blocked' } }).firebase, null, 'B: invalid Firebase is ignored by memory');
  assert.equal(createEnvironment({ dataDriver: 'firebase', firebase: validFirebase }).driver, 'firebase', 'C: valid emulator config');
  assert.equal(createEnvironment({ dataDriver: 'firebase', firebase: { apiKey:'key',authDomain:'app.firebaseapp.com',projectId:'production-project',appId:'1:prod:web:1' } }).firebase.useEmulator, false, 'D: production config');
  assert.throws(() => createEnvironment({ dataDriver: 'firebase' }), error => error instanceof ConfigurationError && error.code === 'BOOT_CONFIG_FIREBASE_MISSING', 'E: missing config');
});

test('memory bootstrap has no static Firebase SDK boundary import', async () => {
  const source = await readFile(new URL('../../src/app/bootstrap.js', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /^import .*infrastructure\/firebase/m, 'Firebase must only be dynamically imported after driver selection');
});
