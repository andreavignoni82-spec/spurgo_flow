import { bootstrap } from './bootstrap.js';

const root = document.querySelector('#app');

bootstrap(root)
  .then(() => window.dispatchEvent(new Event('spurgo-flow:ready')))
  .catch((error) => {
    console.error('Spurgo Flow bootstrap failed', error);
    if (root) root.innerHTML = '<main role="alert" style="padding:24px;font-family:system-ui"><h1>Spurgo Flow</h1><p>Errore di avvio. Ricarica la pagina.</p></main>';
  });

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register(new URL('../../sw.js', import.meta.url)).catch((error) => {
    console.error('Service worker registration failed', error);
  });
}
