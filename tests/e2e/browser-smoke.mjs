import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium, devices } from 'playwright';

const url = process.env.SMOKE_URL ?? 'http://127.0.0.1:4173/spurgo_flow_v8/';
const serviceWorker = process.env.SMOKE_SERVICE_WORKER === 'disabled' ? 'block' : 'allow';
const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH });
const page = await browser.newPage({ ...devices['iPhone 13'], viewport: { width: 390, height: 844 }, serviceWorkers: serviceWorker });
page.setDefaultTimeout(5_000);
const fatalErrors = [];
page.on('pageerror', error => fatalErrors.push(`pageerror: ${error.message}`));
page.on('console', message => { if (message.type() === 'error') fatalErrors.push(`console: ${message.text()}`); });
await page.goto(url, { waitUntil: 'networkidle' });
await page.locator('[data-feature="dashboard"]').waitFor();
const initial = await page.locator('#app').innerText();
assert.doesNotMatch(initial, /Errore di avvio/);
assert.match(initial, /BOOT CORE FIX/);
assert.match(initial, /v8\.0\.0-beta\.1\.1/);

for (const button of ['Clienti','Mezzi','Operatori','Interventi','Agenda','Control Room','Messaggi','Rapportini','Statistiche','App operatore']) {
  await page.getByRole('button', { name: button, exact: true }).click();
  await page.waitForTimeout(50);
  assert.ok((await page.locator('#app').innerText()).trim(), `${button} must keep the shell visible`);
  assert.doesNotMatch(await page.locator('#app').innerText(), /Errore di avvio/, `${button} must not cause a global failure`);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-feature="dashboard"]').waitFor();
}

if (serviceWorker === 'allow') {
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('[data-feature="dashboard"]').waitFor();
  assert.ok(await page.evaluate(() => navigator.serviceWorker.controller !== null), 'service worker must control the GitHub Pages path');
  assert.deepEqual((await page.evaluate(() => caches.keys())).filter(key => key.startsWith('spurgoflow-v8')), ['spurgoflow-v8-0.0-beta.1.1-boot-core-fix']);
}
assert.deepEqual(fatalErrors, []);
await mkdir('artifacts', { recursive: true });
await page.screenshot({ path: `artifacts/spurgo-flow-v8-beta1.1-${serviceWorker}.png`, fullPage: true });
await browser.close();
console.log(`Browser smoke passed (${serviceWorker} service worker, 390x844): ${url}`);
