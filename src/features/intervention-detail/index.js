import { shell,loading,esc } from '../../shared/ui/operational.js';
let root,ctx,busy=false,item=null,lastMessage='';
const selectedId=()=>sessionStorage.getItem('spurgo:selected-intervention');
const option=(id,label,selected=false)=>`<option value="${esc(id)}" ${selected?'selected':''}>${esc(label)}</option>`;
const timeModeOf=current=>current.timeMode==='FLEXIBLE'?'FLEXIBLE':'FIXED';
function timingFields(current){const mode=timeModeOf(current);return `<fieldset class="ops-card" style="padding:14px"><legend><strong>Orario intervento</strong></legend><div class="actions" style="margin-bottom:10px"><label><input type="radio" name="timeMode" value="FIXED" ${mode==='FIXED'?'checked':''}> Orario fisso</label><label><input type="radio" name="timeMode" value="FLEXIBLE" ${mode==='FLEXIBLE'?'checked':''}> Orario flessibile</label></div><div data-time-fixed ${mode==='FLEXIBLE'?'hidden':''}><label>Ora fissa<input type="time" name="startTime" value="${esc(current.startTime||'07:00')}"></label></div><div data-time-flex ${mode==='FIXED'?'hidden':''}><label>Finestra da<input type="time" name="flexibleStartTime" value="${esc(current.flexibleStartTime||current.startTime||'07:00')}"></label><label>Finestra a<input type="time" name="flexibleEndTime" value="${esc(current.flexibleEndTime||'12:00')}"></label><p class="muted">Lo Smart Scheduler potrà scegliere l'orario migliore all'interno di questa finestra.</p></div></fieldset>`}
async function render(){
  const id=selectedId();
  if(!id){root.innerHTML=shell('Intervento','<section class="ops-card"><p>Nessun intervento selezionato.</p><button data-route="interventions">Torna agli interventi</button></section>');return;}
  const [current,operators,teams,vehicles]=await Promise.all([ctx.services.interventions.getIntervention(id),ctx.services.operators.listOperators(),ctx.services.teams.listTeams(),ctx.services.vehicles.listVehicles()]);
  if(!current){root.innerHTML=shell('Intervento','<section class="ops-card"><p>Intervento non trovato.</p><button data-route="interventions">Torna agli interventi</button></section>');return;}
  item=current;
  const assignedOps=new Set(current.assignedOperatorIds??[]),assignedTeams=new Set(current.assignedTeamIds??[]);
  root.innerHTML=shell('Scheda intervento',`<section class="ops-card"><div class="table-title"><div><h2>${esc(current.clientSnapshot?.name||'Intervento')}</h2><small>${esc(current.id)}</small></div><button data-route="interventions" class="ghost">← Elenco interventi</button></div>${lastMessage?`<p class="badge">${esc(lastMessage)}</p>`:''}<form id="intervention-detail-form" class="ops-form"><label>Cliente<input value="${esc(current.clientSnapshot?.name||'')}" disabled></label><label>Indirizzo<input name="address" value="${esc(current.address||'')}" required></label><label>Città<input name="city" value="${esc(current.city||'')}"></label><label>Data<input type="date" name="date" value="${esc(current.date||'')}" required></label>${timingFields(current)}<label>Durata stimata (min)<input type="number" name="estimatedMinutes" min="1" value="${Number(current.estimatedMinutes)||60}" required></label><label>Tipologia<input name="type" value="${esc(current.type||'')}" required></label><label>Priorità<select name="priority"><option ${current.priority==='NORMALE'?'selected':''}>NORMALE</option><option ${current.priority==='URGENTE'?'selected':''}>URGENTE</option></select></label><label>Operatori<select multiple name="operatorIds">${operators.filter(x=>x.active||assignedOps.has(x.id)).map(o=>option(o.id,o.name,assignedOps.has(o.id))).join('')}</select></label><label>Squadre<select multiple name="teamIds">${teams.filter(x=>x.active||assignedTeams.has(x.id)).map(t=>option(t.id,t.name,assignedTeams.has(t.id))).join('')}</select></label><label>Mezzo<select name="vehicleId"><option value="">Nessuno</option>${vehicles.filter(x=>x.active||x.id===current.vehicleId).map(v=>option(v.id,v.plate||v.name||v.id,v.id===current.vehicleId)).join('')}</select></label><label>Note<textarea name="notes">${esc(current.notes||'')}</textarea></label><div class="actions"><button class="primary" type="submit">Salva modifiche</button><button type="button" data-action="reload">Annulla modifiche</button></div><output data-save-status></output></form></section>`);
}
function toggleTimeMode(form){const mode=form.elements.timeMode?.value||'FIXED',fixed=form.querySelector('[data-time-fixed]'),flex=form.querySelector('[data-time-flex]');if(fixed)fixed.hidden=mode!=='FIXED';if(flex)flex.hidden=mode!=='FLEXIBLE';}
async function submit(event){
  if(event.target.id!=='intervention-detail-form')return;
  event.preventDefault(); if(busy)return; busy=true;
  const form=event.target,submitter=event.submitter,out=form.querySelector('[data-save-status]'); if(submitter)submitter.disabled=true;
  try{
    const fd=new FormData(form),mode=String(fd.get('timeMode')||'FIXED');
    const fixed=String(fd.get('startTime')||''),flexStart=String(fd.get('flexibleStartTime')||''),flexEnd=String(fd.get('flexibleEndTime')||'');
    if(mode==='FIXED'&&!fixed)throw new Error('Inserisci l’orario fisso.');
    if(mode==='FLEXIBLE'&&(!flexStart||!flexEnd))throw new Error('Inserisci l’intervallo dell’orario flessibile.');
    if(mode==='FLEXIBLE'&&flexEnd<=flexStart)throw new Error('La fine della finestra flessibile deve essere successiva all’inizio.');
    const effectiveStart=mode==='FIXED'?fixed:flexStart;
    const patch={address:String(fd.get('address')||''),city:String(fd.get('city')||''),date:String(fd.get('date')||''),startTime:effectiveStart,estimatedMinutes:Number(fd.get('estimatedMinutes')),type:String(fd.get('type')||''),priority:String(fd.get('priority')||'NORMALE'),notes:String(fd.get('notes')||''),timeMode:mode,flexibleStartTime:mode==='FLEXIBLE'?flexStart:null,flexibleEndTime:mode==='FLEXIBLE'?flexEnd:null};
    await ctx.services.interventions.updateIntervention(item.id,patch);
    await ctx.services.interventions.assignTeams(item.id,fd.getAll('teamIds'));
    await ctx.services.interventions.assignOperators(item.id,fd.getAll('operatorIds'));
    await ctx.services.interventions.assignVehicle(item.id,String(fd.get('vehicleId')||''));
    const verified=await ctx.services.interventions.getIntervention(item.id);
    if(!verified||verified.address!==patch.address||verified.date!==patch.date||verified.startTime!==patch.startTime||verified.timeMode!==patch.timeMode)throw new Error('Verifica salvataggio non riuscita. Riprova.');
    lastMessage='Modifiche salvate correttamente.'; if(out)out.textContent=lastMessage; await render();
  }catch(error){lastMessage='';if(out)out.textContent=error?.message||'Salvataggio non riuscito.';}
  finally{busy=false;if(submitter)submitter.disabled=false;}
}
function click(event){if(event.target.closest?.('[data-action="reload"]')){lastMessage='';render();}}
function change(event){if(event.target?.name==='timeMode')toggleTimeMode(event.target.form);}
export const interventionDetailFeature=Object.freeze({id:'intervention-detail',async mount(container,context){root=container;ctx=context;lastMessage='';root.innerHTML=loading('Scheda intervento');root.addEventListener('submit',submit);root.addEventListener('click',click);root.addEventListener('change',change);await render();},unmount(){root?.removeEventListener('submit',submit);root?.removeEventListener('click',click);root?.removeEventListener('change',change);root=ctx=undefined;item=null;busy=false;lastMessage='';}});
