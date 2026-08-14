const CACHE='spurgoflow-v7-0.0-alpha.10-reports-module';
const LOCAL=['./index.html','./planning.js','./firebase-sync.js','./manifest.webmanifest','./icon-192.png','./icon-512.png','./qr-demo-intervento.png','./src/dashboard-entry.js','./src/core/bootstrap.js','./src/core/router.js','./src/core/event-bus.js','./src/core/app-state.js','./src/core/error-boundary.js','./src/core/version.js','./src/features/messages/messages.feature.js','./src/features/messages/messages.model.js','./src/features/messages/messages.view.js','./src/features/messages/messages.css','./src/shared/models/message.js','./src/features/dashboard/dashboard.feature.js','./src/features/dashboard/dashboard.model.js','./src/features/dashboard/dashboard.view.js','./src/features/dashboard/dashboard.css','./src/features/clients/clients.feature.js','./src/features/clients/clients.model.js','./src/features/clients/clients.view.js','./src/features/clients/clients.css','./src/features/fleet/fleet.feature.js','./src/features/fleet/fleet.model.js','./src/features/fleet/fleet.view.js','./src/features/fleet/fleet.css','./src/features/people/people.feature.js','./src/features/people/people.model.js','./src/features/people/people.view.js','./src/features/people/people.css','./src/features/people/operators/operators.controller.js','./src/features/people/operators/operators.form.js','./src/features/people/operators/operators.validators.js','./src/features/people/operators/operators.view.js','./src/features/people/teams/teams.controller.js','./src/features/people/teams/teams.form.js','./src/features/people/teams/teams.view.js','./src/features/interventions/interventions.feature.js','./src/features/interventions/interventions.model.js','./src/features/interventions/interventions.view.js','./src/features/interventions/interventions.form.js','./src/features/interventions/interventions.validators.js','./src/features/interventions/interventions.css','./src/features/agenda/agenda.feature.js','./src/features/agenda/agenda.model.js','./src/features/agenda/agenda.timeline.js','./src/features/agenda/agenda.view.js','./src/features/agenda/agenda.css','./src/features/control-room/control-room.feature.js','./src/features/control-room/control-room.model.js','./src/features/control-room/control-room.timeline.js','./src/features/control-room/control-room.view.js','./src/features/control-room/control-room.css','./src/services/planning-service.js','./src/services/maps-service.js','./src/services/interventions/interventions.service.js','./src/services/interventions/intervention-status.service.js','./src/services/interventions/intervention-assignment.service.js','./src/services/interventions/interventions-legacy-bridge.js','./src/services/availability-service.js','./src/services/firebase/auth-service.js','./src/shared/models/intervention.js','./src/shared/utils/operator-username.js','./src/services/legacy-adapter.js','./src/services/repositories/base-repository.js','./src/services/repositories/clients-repository.js','./src/services/repositories/interventions-repository.js','./src/services/repositories/operators-repository.js','./src/services/repositories/teams-repository.js','./src/services/repositories/vehicles-repository.js','./src/services/repositories/messages-repository.js','./src/shared/styles/tokens.css','./src/shared/styles/base.css','./src/shared/styles/components.css','./src/shared/models/report.js','./src/services/repositories/reports-repository.js','./src/services/reports/reports.service.js','./src/services/reports/report-preview.service.js','./src/services/reports/report-export.service.js','./src/features/reports/reports.feature.js','./src/features/reports/reports.model.js','./src/features/reports/reports.view.js','./src/features/reports/reports.form.js','./src/features/reports/reports.css','./src/features/reports/signatures/signature-pad.js','./src/features/reports/signatures/signature.model.js','./src/features/reports/photos/report-photos.js','./src/features/reports/photos/report-photos.model.js','./src/features/reports/preview/report-preview.js','./src/features/reports/preview/report-template.js','./src/features/reports/preview/report-print.css','./src/features/reports/sharing/report-sharing.js'];

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
        keys.filter(k=>k.startsWith('spurgoflow-')&&k!==CACHE).map(k=>caches.delete(k))
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
