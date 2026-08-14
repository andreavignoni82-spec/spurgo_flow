import { bootstrap } from './bootstrap.js';

bootstrap().then(() => window.dispatchEvent(new Event('spurgo-flow:ready'))).catch((error) => {
  console.error('Spurgo Flow bootstrap failed', error);
  const root = document.querySelector('#app');
  if (root) {
    const driver = String(globalThis.__SPURGO_FLOW_ENV__?.dataDriver ?? globalThis.__SPURGO_FLOW_ENV__?.driver ?? 'memory').toUpperCase();
    const safe = value => String(value ?? 'UNKNOWN').replace(/[&<>"']/g, character => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[character]);
    root.innerHTML = `<main role="alert"><strong>SPURGO FLOW 8 · BOOT CORE FIX</strong><h1>Errore di avvio</h1><p>Driver: ${safe(driver)}</p><p>Errore: ${safe(error.code)}</p><p>Componente: ${safe(error.component)}</p><small>v8.0.0-beta.1.1</small></main>`;
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url)).catch((error) => {
    console.error('Service worker registration failed', error);
  });
}
