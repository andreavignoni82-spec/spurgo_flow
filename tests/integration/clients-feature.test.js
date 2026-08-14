import test from 'node:test';
import assert from 'node:assert/strict';
import { parseHTML } from 'linkedom';
import { createClientsFeature } from '../../src/features/clients/clients.feature.js';
import { createLifecycle } from '../../src/core/lifecycle.js';

const dom = () => { const parsed = parseHTML('<div id="app"></div>'); globalThis.document = parsed.document; return parsed.document; };
test('ClientsFeature mounts, loads, searches, edits realtime data and cleans up', async () => {
  const document = dom(); const lifecycle = createLifecycle(); let stopped = false; let subscriber;
  const service = { listClients: async () => [{ id:'1', name:'Beta', city:'Roma', active:true }], subscribeClients: callback => { subscriber = callback; return () => { stopped = true; }; }, setClientActive: async()=>{} };
  const feature = createClientsFeature(); await feature.mount(document.querySelector('#app'), { services:{ clients:service }, lifecycle });
  const app = document.querySelector('#app'); assert.match(app.textContent, /CLIENTI & IMPIANTI/); assert.match(app.textContent, /Beta/);
  const search = document.querySelector('[data-client-search]'); search.value = 'missing'; search.dispatchEvent(new document.defaultView.Event('input', { bubbles:true })); assert.doesNotMatch(app.textContent, /Beta/);
  subscriber({ type:'snapshot', records:[{ id:'2', name:'Alfa', active:false }] }); assert.match(app.textContent, /Nessun cliente/);
  feature.unmount(); assert.equal(stopped, true); assert.equal(document.querySelector('[data-feature="clients"]'), null);
});

test('ClientsFeature isolates load and realtime failures without losing the shell', async () => {
  const document = dom(); const lifecycle = createLifecycle(); let subscriber;
  const feature = createClientsFeature(); await feature.mount(document.querySelector('#app'), { services:{ clients:{ listClients:async()=>{ throw new Error('offline'); }, subscribeClients:callback=>{ subscriber=callback; return ()=>{}; } } }, lifecycle });
  const app = document.querySelector('#app'); assert.match(app.textContent, /Clienti temporaneamente non disponibili/);
  subscriber({ type:'error', error:new Error('stream') }); assert.match(app.textContent, /Sincronizzazione realtime non disponibile/); assert.match(app.textContent, /Dashboard/);
  feature.unmount();
});
