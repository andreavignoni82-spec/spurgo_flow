import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { bootstrap } from '../../src/app/bootstrap.js';
import { ErrorBoundary } from '../../src/core/error-boundary.js';
import { Router } from '../../src/app/router.js';
import { renderBootFallback } from '../../src/app/fallback.js';

function installDom(markup = '<div id="app"></div>') { const { document, window } = parseHTML(markup); globalThis.document = document; globalThis.window = window; return document; }

test('bootstrap mounts the login route and visible v8.4.3 shell', async () => {
  const document = installDom(); const app = document.querySelector('#app'); const application = await bootstrap(app);
  assert.ok(application.router); assert.ok(app.querySelector('.login-page')); assert.match(app.textContent, /v8\.4\.3/); await application.close();
});

test('bootstrap rejects clearly when #app is absent', async () => { installDom('<body></body>'); await assert.rejects(() => bootstrap(), /#app container not found/); });

test('a failed feature renders a visible fallback instead of a blank page', async () => {
  const document = installDom(); const app = document.querySelector('#app');
  const router = new Router({ routes: { broken: { id: 'broken', mount() { throw new Error('broken feature'); }, unmount() {} } }, container: app, context: {}, errorBoundary: new ErrorBoundary(), onMountError: () => renderBootFallback(app, 'Feature non disponibile') });
  assert.equal(await router.navigate('broken'), false); assert.match(app.textContent, /SPURGO FLOW 8.*Feature non disponibile/s); assert.match(app.textContent, /v8\.4\.3/);
});
