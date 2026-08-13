(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  root.SFPlanning=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';
  const CONFIG=Object.freeze({
    fallbackDurationMinutes:60,
    missingCoordinatesTravelMinutes:30,
    averageSpeedKmh:38,
    travelBufferMinutes:8,
    warningMarginMinutes:15,
    criticalDelayMinutes:30,
    dayStartMinutes:6*60,
    dayEndMinutes:20*60
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
  return {CONFIG,minute,estimateTravelMinutes,buildSchedule,resourceAvailability,scoreResourceForJob,findResourceAlternatives,findScheduleGaps};
});
