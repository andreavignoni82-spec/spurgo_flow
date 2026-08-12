const CACHE='spurgoflow-v6-6.1.3-data-layer-fix';
const LOCAL=['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./qr-demo-intervento.png','./SETUP_FIREBASE.md'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(LOCAL))));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x))))));
self.addEventListener('fetch',e=>{
 const u=new URL(e.request.url);
 if(u.hostname.includes('openstreetmap.org')||u.hostname.includes('unpkg.com')||u.hostname.includes('nominatim.openstreetmap.org')||u.pathname.endsWith('/firebase-config.js')||u.pathname.endsWith('/firebase-sync.js')){
   e.respondWith(fetch(e.request).catch(()=>caches.match(e.request)));
   return;
 }
 e.respondWith(fetch(e.request).then(r=>{const copy=r.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return r}).catch(()=>caches.match(e.request)));
});