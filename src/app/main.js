import { bootstrap } from './bootstrap.js';
const root = document.querySelector('#app');
bootstrap(root);
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js');
