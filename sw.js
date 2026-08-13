const CACHE='spurgoflow-v6-6.1.21-agenda-colors-refresh30';
const LOCAL=['./planning.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./qr-demo-intervento.png'];

self.addEventListener('install',e=>{
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(c=>c.addAll(LOCAL))
  )
});

self.addEventListener('activate',e=>{
  e.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(
        keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))
      ))
      .then(()=>self.clients.claim())
  )
});

self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);

  if(
    e.request.mode==='navigate' ||
    u.pathname.endsWith('/index.html') ||
    u.pathname.endsWith('/firebase-config.js') ||
    u.pathname.endsWith('/firebase-sync.js') ||
    u.pathname.endsWith('/sw.js')
  ){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .catch(()=>caches.match('./index.html'))
    );
    return;
  }

  if(
    u.hostname.includes('geocode.arcgis.com') ||
    u.hostname.includes('cdnjs.cloudflare.com') ||
    u.hostname.includes('unpkg.com') ||
    u.hostname.includes('openstreetmap.org') ||
    u.hostname.includes('googleapis.com') ||
    u.hostname.includes('gstatic.com')
  ){
    e.respondWith(
      fetch(e.request,{cache:'no-store'})
        .catch(()=>caches.match(e.request))
    );
    return;
  }

  e.respondWith(
    caches.match(e.request).then(
      cached=>cached || fetch(e.request).then(resp=>{
        const copy=resp.clone();
        caches.open(CACHE).then(c=>c.put(e.request,copy));
        return resp;
      })
    )
  );
});