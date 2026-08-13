(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SFPlanning=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const WORKDAY=Object.freeze({morningStart:'07:00',morningEnd:'12:00',afternoonStart:'13:00',afternoonEnd:'17:00'});
  const SMART_SLOT_CONFIG=Object.freeze({minimumSafeBuffer:20,minimumTightBuffer:10,maxSuggestions:5,searchDays:7});
  const CONFIG=Object.freeze({
    fallbackDurationMinutes:60,
    missingCoordinatesTravelMinutes:30,
    averageSpeedKmh:38,
    travelBufferMinutes:8,
    warningMarginMinutes:15,
    criticalDelayMinutes:30,
    dayStartMinutes:7*60,
    dayEndMinutes:17*60,
    lunchStartMinutes:12*60,
    lunchEndMinutes:13*60,
    minimumBufferMinutes:SMART_SLOT_CONFIG.minimumTightBuffer,
    minimumSafeBuffer:SMART_SLOT_CONFIG.minimumSafeBuffer,
    minimumTightBuffer:SMART_SLOT_CONFIG.minimumTightBuffer,
    searchDays:SMART_SLOT_CONFIG.searchDays,
    maxSuggestions:SMART_SLOT_CONFIG.maxSuggestions,
    slotStepMinutes:5
  });
  const minute=(value,date)=>{
    if(value===null||value===undefined||value==='')return null;
    if(typeof value==='number'&&Number.isFinite(value))return value;
    const text=String(value),clock=text.match(/^(\d{1,2}):(\d{2})/);
    if(clock)return Number(clock[1])*60+Number(clock[2]);
    const parsed=new Date(text);
    if(!Number.isNaN(parsed.getTime())&&(!date||parsed.toISOString().slice(0,10)===date))return parsed.getHours()*60+parsed.getMinutes();
    return null;
  };
  const coordinates=job=>{
    const lat=Number(job?.lat??job?.latitude??job?.coords?.lat),lng=Number(job?.lng??job?.lon??job?.longitude??job?.coords?.lng);
    return Number.isFinite(lat)&&Number.isFinite(lng)?{lat,lng}:null;
  };
  function estimateTravelMinutes(fromJob,toJob,config=CONFIG){
    const a=coordinates(fromJob),b=coordinates(toJob);
    if(!a||!b)return {minutes:config.missingCoordinatesTravelMinutes,estimated:true,reason:'coordinate mancanti'};
    const rad=x=>x*Math.PI/180,dLat=rad(b.lat-a.lat),dLng=rad(b.lng-a.lng);
    const h=Math.sin(dLat/2)**2+Math.cos(rad(a.lat))*Math.cos(rad(b.lat))*Math.sin(dLng/2)**2;
    const km=6371*2*Math.atan2(Math.sqrt(h),Math.sqrt(1-h));
    return {minutes:Math.max(config.travelBufferMinutes,Math.ceil(km/config.averageSpeedKmh*60+config.travelBufferMinutes)),estimated:true,reason:'stima geografica prudenziale',distanceKm:km};
  }
  const duration=(job,config)=>{const n=Number(job?.estimatedMinutes);return Number.isFinite(n)&&n>0?{minutes:n,fallback:false}:{minutes:config.fallbackDurationMinutes,fallback:true}};
  function classify(delta,overlap,config){
    if(overlap||delta>=config.criticalDelayMinutes)return'critical';
    if(delta>0)return'delay';
    if(-delta<config.warningMarginMinutes)return'warning';
    return'ok';
  }
  function buildSchedule(jobs,options={}){
    const config={...CONFIG,...options.config},now=options.nowMinutes??null;
    const active=(jobs||[]).filter(j=>j&&j.status!=='Annullato').sort((a,b)=>(minute(a.time,a.date)??config.dayStartMinutes)-(minute(b.time,b.date)??config.dayStartMinutes));
    let available=null,previous=null;
    return active.map((job,index)=>{
      const plannedStart=minute(job.time,job.date)??(available??config.dayStartMinutes),d=duration(job,config);
      const realStart=minute(job.startedAt??job.realStart??job.startTime,job.date);
      const realEnd=minute(job.closedAt??job.realEnd??job.endTime,job.date);
      const travel=previous?estimateTravelMinutes(previous.job,job,config):{minutes:0,estimated:false,reason:'prima attività'};
      const arrival=available===null?plannedStart:available+travel.minutes;
      const start=Math.max(plannedStart,arrival,job.status==='In corso'&&realStart!==null?realStart:0);
      let end=start+d.minutes;
      if(job.status==='Terminato'&&realEnd!==null)end=realEnd;
      else if(job.status==='In corso'&&realStart!==null&&now!==null)end=Math.max(now,realStart)+Math.max(0,d.minutes-Math.max(0,now-realStart));
      const delta=arrival-plannedStart,overlap=previous?available>plannedStart:false;
      const row={job,index,plannedStart,durationMinutes:d.minutes,durationFallback:d.fallback,travelMinutes:travel.minutes,travelEstimated:travel.estimated,travelReason:travel.reason,arrival,start,end,delta,margin:-delta,severity:index===0?'ok':classify(delta,overlap,config),overlap};
      available=end;previous=row;return row;
    });
  }
  function resourceAvailability(schedule,nowMinutes=0){
    const current=schedule.find(x=>x.job.status==='In corso');
    if(current)return {minutes:current.end,job:current.job,state:'IN INTERVENTO'};
    const next=schedule.find(x=>x.end>=nowMinutes);
    return {minutes:next?Math.max(nowMinutes,next.start):nowMinutes,job:next?.job||null,state:next?'DISPONIBILE':'LIBERO'};
  }
  function scoreResourceForJob(resource,job,schedule,options={}){
    const now=options.nowMinutes??0,availability=resourceAvailability(schedule,now),last=[...schedule].reverse().find(x=>x.end<=availability.minutes)?.job;
    const travel=estimateTravelMinutes(last,job,{...CONFIG,...options.config});
    const planned=minute(job.time,job.date)??availability.minutes,arrival=availability.minutes+travel.minutes,delay=Math.max(0,arrival-planned);
    const impacted=schedule.filter(x=>x.plannedStart>=planned&&x.job.id!==job.id&&arrival+(Number(job.estimatedMinutes)||CONFIG.fallbackDurationMinutes)>x.plannedStart);
    const score=delay*100+travel.minutes*5+impacted.length*500+schedule.length*2-(String(job.priority||job.status).toLowerCase().includes('urgent')?1000:0);
    return {resource,score,arrival,travelMinutes:travel.minutes,travelEstimated:travel.estimated,margin:planned-arrival,impacted};
  }
  function findResourceAlternatives(resources,job,schedules,options={}){
    return (resources||[]).filter(r=>r.available!==false).map(r=>scoreResourceForJob(r,job,schedules[r.id]||[],options)).sort((a,b)=>a.score-b.score||String(a.resource.id).localeCompare(String(b.resource.id))).slice(0,options.limit||3);
  }
  function findScheduleGaps(schedule,minMinutes,config=CONFIG){
    const gaps=[];let cursor=config.dayStartMinutes;
    schedule.forEach(x=>{if(x.start-cursor>=minMinutes)gaps.push({start:cursor,end:x.start,minutes:x.start-cursor});cursor=Math.max(cursor,x.end)});
    if(config.dayEndMinutes-cursor>=minMinutes)gaps.push({start:cursor,end:config.dayEndMinutes,minutes:config.dayEndMinutes-cursor});return gaps;
  }
  const dateKey=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const clock=n=>`${String(Math.floor(n/60)).padStart(2,'0')}:${String(n%60).padStart(2,'0')}`;
  function plannerResources(teams=[],operators=[]){
    const teamRows=teams.filter(t=>t.active!==false).map(t=>({id:'team:'+t.id,name:t.name,available:true,vehicle:t.vehicle,skills:(t.operatorIds||[]).map(id=>operators.find(o=>o.id===id)?.ruolo||'')}));
    const operatorRows=operators.filter(o=>o.active!==false).map(o=>({id:'op:'+o.id,name:[o.nome,o.cognome].filter(Boolean).join(' ')||o.name||o.id,available:true,role:o.ruolo,vehicle:o.mezzo}));
    return teamRows.concat(operatorRows);
  }
  function assignmentForResource(resourceId,teams=[]){
    if(String(resourceId).startsWith('team:')){const teamId=resourceId.slice(5),team=teams.find(t=>String(t.id)===teamId);return {teamId,operatorIds:[...(team?.operatorIds||[])]}}
    return {teamId:'',operatorIds:String(resourceId).startsWith('op:')?[resourceId.slice(3)]:[]};
  }
  function scoreSlotCandidate(c){
    return (c.constraintMatch?0:1200)+(c.problematic?5000:0)+(c.impactMinutes||0)*80+
      c.totalTravelMinutes*8-Math.min(c.marginBefore+c.marginAfter,180)*2+
      (c.resourceLoadMinutes||0)*.12+(c.resourceJobCount||0)*12+(c.idleMinutes||0)*.04;
  }
  function explainCandidate(c){
    if(c.urgent&&c.problematic)return'URGENZA — impatto previsto.';
    if(c.totalTravelMinutes<=20)return'Percorso più breve e coerente con la sequenza della giornata.';
    if(!c.previous&&!c.next)return'Primo slot disponibile della giornata; carico risorsa bilanciato.';
    if(!c.problematic)return'Minore impatto sugli appuntamenti esistenti.';
    return'Alternativa più vicina al vincolo richiesto, con impatto segnalato.';
  }
  function findBestSlots(jobDraft,options={}){
    const config={...CONFIG,...options.config};
    if(!(jobDraft?.address||coordinates(jobDraft)))return {suggestions:[],error:'Inserisci un indirizzo o le coordinate dell’intervento.'};
    const d=Number(jobDraft.estimatedMinutes);
    if(!Number.isFinite(d)||d<=0)return {suggestions:[],error:'Indica la durata stimata prima di cercare uno slot.'};
    const availability=options.resourceAvailability||(()=>true);
    const resources=(options.resources||[]).filter(r=>r.available!==false),jobs=options.jobs||[],cache=new Map(),urgent=String(jobDraft.priority||jobDraft.status||'').toLowerCase().includes('urgent');
    if(!resources.length)return {suggestions:[],error:'Nessuna risorsa selezionata.'};
    const enforceNow=options.now instanceof Date,now=enforceNow?options.now:new Date(),startKey=options.startDate||jobDraft.date||dateKey(now);
    const startDate=new Date(startKey+'T12:00:00'),days=(options.onlyThisDay||jobDraft.fixedTime)?1:config.searchDays,candidates=[];
    let availableResources=0;
    const travel=(a,b)=>{if(!a||!b)return {minutes:0,estimated:false};const key=[a.id||a.address||JSON.stringify(coordinates(a)),b.id||b.address||JSON.stringify(coordinates(b))].join('>');if(!cache.has(key))cache.set(key,estimateTravelMinutes(a,b,config));return cache.get(key)};
    for(let di=0;di<days;di++){
      const day=new Date(startDate);day.setDate(day.getDate()+di);const date=dateKey(day);
      for(const resource of resources){
        if(!availability(date,resource.id,resource))continue;
        availableResources++;
        const rows=buildSchedule(jobs.filter(j=>j.date===date&&j.status!=='Annullato'&&(options.resourceId?options.resourceId(j)===resource.id:j.resourceId===resource.id)),{config});
        const load=rows.reduce((n,x)=>n+x.durationMinutes+x.travelMinutes,0);
        for(let gi=0;gi<=rows.length;gi++){
          const previous=rows[gi-1]||null,next=rows[gi]||null,from=previous?.job||resource.location||null;
          const before=travel(from,jobDraft),after=travel(jobDraft,next?.job);
          const todayMinimum=enforceNow&&date===dateKey(now)?now.getHours()*60+now.getMinutes()+before.minutes+config.minimumBufferMinutes:config.dayStartMinutes;
          const earliest=Math.max((previous?previous.end:config.dayStartMinutes)+before.minutes+(previous?config.minimumBufferMinutes:0),todayMinimum);
          const latest=(next?next.plannedStart-after.minutes-config.minimumBufferMinutes:config.dayEndMinutes)-d;
          const range=jobDraft.preferredRange;
          const segments=[[config.dayStartMinutes,config.lunchStartMinutes],[config.lunchEndMinutes,config.dayEndMinutes]];
          const starts=jobDraft.fixedTime?[minute(jobDraft.time,date)]:segments.map(([a])=>Math.ceil(Math.max(earliest,a,range?.from??a)/config.slotStepMinutes)*config.slotStepMinutes);
          for(const start of starts){
          if(start===null)continue;
          const segment=segments.find(([a,b])=>start>=a&&start+d<=b);
          const inRange=!range||(start>=range.from&&start+d<=range.to);
          const impact=Math.max(0,start-latest,earliest-start),outsideWorkday=!segment;
          if((outsideWorkday||!inRange)&&!urgent)continue;
          const problematic=impact>0||outsideWorkday||!inRange;
          if(problematic&&!urgent)continue;
          const constraintMatch=(!jobDraft.date||date===jobDraft.date)&&inRange&&!outsideWorkday;
          const effectiveLatest=Math.min(latest,segment?.[1]-d??latest);
          const operationalMargin=Math.max(0,effectiveLatest-start);
          const classification=problematic?'SCONSIGLIATO':operationalMargin>=config.minimumSafeBuffer?'SICURO':operationalMargin>=config.minimumTightBuffer?'STRETTO':'SCONSIGLIATO';
          const c={date,start,time:clock(start),end:start+d,endTime:clock(start+d),durationMinutes:d,resource,previous:previous?.job||null,next:next?.job||null,travelBeforeMinutes:before.minutes,travelAfterMinutes:after.minutes,totalTravelMinutes:before.minutes+after.minutes,travelEstimated:before.estimated||after.estimated,coordinatesIncomplete:!coordinates(jobDraft),marginBefore:Math.max(0,start-earliest),marginAfter:Math.max(0,latest-start),impactMinutes:impact,impacted:impact&&next?[{job:next.job,delayMinutes:impact}]:[],problematic,constraintMatch,urgent,resourceLoadMinutes:load,resourceJobCount:rows.length,idleMinutes:Math.max(0,start-earliest)};
          c.classification=classification;c.operationalMargin=operationalMargin;c.operationalException=urgent&&problematic;
          c.score=scoreSlotCandidate(c)+(urgent?(di*10000+start)*10:di*30);c.reason=explainCandidate(c);candidates.push(c);
          }
        }
      }
    }
    const rank={SICURO:0,STRETTO:1,SCONSIGLIATO:2};
    candidates.sort((a,b)=>(urgent?0:rank[a.classification]-rank[b.classification])||a.score-b.score||a.date.localeCompare(b.date)||a.start-b.start||String(a.resource.id).localeCompare(String(b.resource.id)));
    const stats={resources:resources.length,excludedByAvailability:resources.length*days-availableResources,candidates:candidates.length,safe:candidates.filter(c=>c.classification==='SICURO').length,tight:candidates.filter(c=>c.classification==='STRETTO').length,discouraged:candidates.filter(c=>c.classification==='SCONSIGLIATO').length};
    const noSlotError=!availableResources?'Tutte le risorse risultano non disponibili':!candidates.length?(options.onlyThisDay?'Nessuno slot disponibile nel giorno selezionato':'Nessuno slot disponibile nei prossimi 7 giorni'):null;
    return {suggestions:candidates.slice(0,config.maxSuggestions),cacheEntries:cache.size,stats,error:jobDraft.fixedTime&&!candidates.some(c=>!c.problematic)?'Nessuna risorsa può garantire questo appuntamento':noSlotError};
  }
  return {CONFIG,WORKDAY,SMART_SLOT_CONFIG,minute,estimateTravelMinutes,buildSchedule,resourceAvailability,plannerResources,assignmentForResource,scoreResourceForJob,findResourceAlternatives,findScheduleGaps,scoreSlotCandidate,findBestSlots};
});
