import { bootstrap } from './bootstrap.js';

bootstrap().then(() => window.dispatchEvent(new Event('spurgo-flow:ready'))).catch((error) => {
  console.error('Spurgo Flow bootstrap failed', error);
  const root = document.querySelector('#app');
  if (root) {
    root.innerHTML = '<main role="alert"><strong>SPURGO FLOW 8</strong><h1>Errore di avvio</h1><p>v8.0.0-alpha.2.1</p><small>v8.0.0-alpha.2.1</small></main>';
  }
});

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url)).catch((error) => {
    console.error('Service worker registration failed', error);
  });
}
