
(function(){
  'use strict';

  const state={office:null,control:null,field:null};
  const $=id=>document.getElementById(id);

  function esc(v){
    return String(v??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
  }

  function coords(job){
    if(job && Number.isFinite(job.opLat) && Number.isFinite(job.opLng)) return [job.opLat,job.opLng];
    if(job && Number.isFinite(job.lat) && Number.isFinite(job.lng)) return [job.lat,job.lng];
    return null;
  }

  function jobs(){
    const a=Array.isArray(window.demoJobs)?window.demoJobs:[];
    const b=Array.isArray(window.completedJobs)?window.completedJobs:[];
    return [...a,...b];
  }

  function selected(){
    return window.selectedJob || jobs()[0] || null;
  }

  function bbox(lat,lng,detail){
    const d=detail==='report'?0.0022:detail==='area'?0.025:0.0042;
    const dlng=d/Math.max(.35,Math.cos(lat*Math.PI/180));
    return [lng-dlng,lat-d,lng+dlng,lat+d];
  }

  function embedUrl(job,detail='detail'){
    const c=coords(job);
    if(!c) return null;
    const [lat,lng]=c;
    const b=bbox(lat,lng,detail).map(v=>v.toFixed(6)).join(',');
    return 'https://www.openstreetmap.org/export/embed.html?bbox='+
      encodeURIComponent(b)+'&layer=mapnik&marker='+encodeURIComponent(lat.toFixed(6)+','+lng.toFixed(6));
  }

  function externalUrl(job){
    const c=coords(job);
    if(c) return 'https://www.openstreetmap.org/?mlat='+c[0]+'&mlon='+c[1]+'#map=17/'+c[0]+'/'+c[1];
    return 'https://www.openstreetmap.org/search?query='+encodeURIComponent(job?.address||'');
  }

  function setStatus(id,text,ok=true){
    const n=$(id); if(!n)return;
    n.textContent=text;
    n.className='sf-map-status '+(ok?'ok':'err');
  }

  function render(id,job,detail='detail',statusId=null){
    const host=$(id); if(!host)return;
    const url=embedUrl(job);
    if(!url){
      host.innerHTML='<div class="sf-map-placeholder">Posizione non ancora disponibile.<br>Usa “Localizza indirizzo”.</div>';
      if(statusId)setStatus(statusId,'Posizione non disponibile',false);
      return;
    }
    host.innerHTML='';
    const iframe=document.createElement('iframe');
    iframe.title='Mappa '+(job?.client||'intervento');
    iframe.src=url;
    iframe.loading='eager';
    iframe.referrerPolicy='no-referrer-when-downgrade';
    iframe.setAttribute('allowfullscreen','');
    iframe.addEventListener('load',()=>{ if(statusId)setStatus(statusId,'Mappa caricata',true); });
    iframe.addEventListener('error',()=>{ if(statusId)setStatus(statusId,'Errore caricamento mappa',false); });
    host.appendChild(iframe);
  }

  function toolbar(id,list,current,handler){
    const host=$(id); if(!host)return;
    host.innerHTML='';
    list.forEach(j=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=j.client||j.id;
      if(j.id===current)b.classList.add('active');
      b.addEventListener('click',()=>handler(j.id));
      host.appendChild(b);
    });
  }

  function findJob(id){ return jobs().find(j=>j.id===id); }

  function showOffice(id){
    const list=jobs();
    const j=findJob(id)||list[0];
    if(!j)return;
    state.office=j.id;
    toolbar('officeMapToolbar',list,j.id,showOffice);
    render('officeMap',j,'area','officeMapStatus');
  }
  function showControl(id){
    const list=jobs();
    const j=findJob(id)||list.find(x=>String(x.status).toLowerCase().includes('urgent'))||list[0];
    if(!j)return;
    state.control=j.id;
    toolbar('controlMapToolbar',list,j.id,showControl);
    render('controlMap',j,'area','controlMapStatus');
  }
  function showField(id){
    const list=Array.isArray(window.demoJobs)?window.demoJobs:[];
    const j=list.find(x=>x.id===id)||selected()||list[0];
    if(!j)return;
    state.field=j.id;
    toolbar('fieldMapToolbar',list,j.id,showField);
    render('fieldRealMap',j,'detail','fieldMapStatus');
  }

  async function geocode(job){
    if(!job || !job.address) return false;
    try{
      const u='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=it&accept-language=it&q='+encodeURIComponent(job.address);
      const r=await fetch(u,{headers:{'Accept':'application/json'}});
      if(!r.ok)return false;
      const d=await r.json();
      if(!d.length)return false;
      job.lat=parseFloat(d[0].lat);
      job.lng=parseFloat(d[0].lon);
      job.coordSource='geocoded';
      return true;
    }catch(e){ return false; }
  }

  async function ensureGeocoded(){
    const list=jobs();
    for(const j of list){
      if(!coords(j) && j.address){
        await geocode(j);
        await new Promise(r=>setTimeout(r,1050));
      }
    }
    const sj=selected();
    if(sj && !coords(sj) && sj.address) await geocode(sj);
  }

  async function init(){
    await ensureGeocoded();
    showOffice(state.office);
    showControl(state.control);
    showField(state.field || selected()?.id);
    renderSelected();
  }

  function renderSelected(){
    render('selectedJobMap',selected(),'detail','selectedJobMapStatus');
  }
  function renderReport(){
    render('reportRealMap',selected(),'report',null);
  }
  function refreshVisible(){
    if($('officeMap')?.offsetParent!==null) showOffice(state.office);
    if($('controlMap')?.offsetParent!==null) showControl(state.control);
    if($('fieldRealMap')?.offsetParent!==null) showField(state.field || selected()?.id);
    if($('selectedJobMap')?.offsetParent!==null) renderSelected();
  }
  function focusSelectedInField(){
    const j=selected(); if(j) showField(j.id);
  }
  function openExternal(job){ window.open(externalUrl(job||selected()),'_blank'); }

  window.SFMaps={
    init,
    renderOffice:()=>showOffice(state.office),
    renderControl:()=>showControl(state.control),
    renderField:()=>showField(state.field || selected()?.id),
    renderSelected,
    renderReport,
    refreshVisible,
    focusSelectedInField,
    openExternal,
    geocode
  };

  window.addEventListener('orientationchange',()=>setTimeout(refreshVisible,250));
  window.addEventListener('pageshow',()=>setTimeout(refreshVisible,150));
})();
