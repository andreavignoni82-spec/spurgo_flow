


const DEFAULT_OPERATORS=[
 {id:'op-marco',nome:'Marco',cognome:'Rossi',username:'marco',password:'marco123',telefono:'',mezzo:'Autobotte 01',ruolo:'Operatore',active:true},
 {id:'op-luca',nome:'Luca',cognome:'Bianchi',username:'luca',password:'luca123',telefono:'',mezzo:'Autobotte 02',ruolo:'Operatore',active:true},
 {id:'op-paolo',nome:'Paolo',cognome:'Verdi',username:'paolo',password:'paolo123',telefono:'',mezzo:'Furgone Video 01',ruolo:'Videoispezione',active:true}
];
const DEFAULT_TEAMS=[
 {id:'team-a',name:'Squadra A',vehicle:'Autobotte 01',operatorIds:['op-marco']},
 {id:'team-b',name:'Squadra B',vehicle:'Autobotte 02',operatorIds:['op-luca']}
];
function loadJson(key,fallback){try{const raw=localStorage.getItem(key);return raw?JSON.parse(raw):JSON.parse(JSON.stringify(fallback))}catch(e){return JSON.parse(JSON.stringify(fallback))}}
let sfOperators=loadJson('sf_operators',DEFAULT_OPERATORS), sfTeams=loadJson('sf_teams',DEFAULT_TEAMS);
function saveOfficePeople(){localStorage.setItem('sf_operators',JSON.stringify(sfOperators));localStorage.setItem('sf_teams',JSON.stringify(sfTeams))}
function esc(t){return String(t??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]))}
function operatorName(o){return (o.nome+' '+o.cognome).trim()}
function renderOperatorChecks(){const h=el('teamOperatorChecks');if(!h)return;h.innerHTML=sfOperators.filter(o=>o.active!==false).map(o=>`<label class="check-row"><input type="checkbox" class="team-op-check" value="${esc(o.id)}"><span>${esc(operatorName(o))}</span></label>`).join('')||'<div class="muted">Crea prima almeno un operatore.</div>'}
function renderOperators(){const h=el('operatorList');if(!h)return;el('operatorCount').textContent=sfOperators.length+' operatori';h.innerHTML=sfOperators.map(o=>`<div class="person-card"><div class="head"><div><b>${esc(operatorName(o))}</b><div class="person-meta">@${esc(o.username)} · ${esc(o.mezzo||'Nessun mezzo')}</div></div><span class="small-pill ${o.active!==false?'green':'orange'}">${o.active!==false?'ATTIVO':'DISATTIVATO'}</span></div><div class="person-meta">${esc(o.ruolo||'Operatore')} ${o.telefono?'· '+esc(o.telefono):''}</div><div class="manage-actions"><button class="btn ghost" onclick="editOperator('${o.id}')">Modifica</button><button class="btn ghost" onclick="changeOperatorPassword('${o.id}')">Password</button><button class="btn ghost" onclick="toggleOperator('${o.id}')">${o.active!==false?'Disattiva':'Riattiva'}</button><button class="btn danger" onclick="deleteOperator('${o.id}')">Elimina</button></div></div>`).join('');renderOperatorChecks()}
function renderTeams(){const h=el('teamList');if(!h)return;el('teamCount').textContent=sfTeams.length+' squadre';h.innerHTML=sfTeams.map(t=>{const names=t.operatorIds.map(id=>sfOperators.find(o=>o.id===id)).filter(Boolean).map(operatorName);return `<div class="team-card"><div class="head"><div><b>${esc(t.name)}</b><div class="team-meta">${esc(t.vehicle||'Nessun mezzo')}</div></div><span class="small-pill green">${names.length} operatori</span></div><div class="team-meta">${names.length?esc(names.join(', ')):'Nessun operatore assegnato'}</div><div class="manage-actions"><button class="btn ghost" onclick="editTeam('${t.id}')">Modifica</button><button class="btn danger" onclick="deleteTeam('${t.id}')">Elimina</button></div></div>`}).join('')}
function renderOfficePeople(){renderOperators();renderTeams()}
function uniqueId(prefix){return prefix+'-'+Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,7)}
function addOperator(){const nome=el('opNome').value.trim(),cognome=el('opCognome').value.trim(),username=el('opUsername').value.trim().toLowerCase(),password=el('opPassword').value;if(!nome||!username||!password){el('operatorFormMsg').textContent='Nome, username e password sono obbligatori.';return}if(sfOperators.some(o=>o.username.toLowerCase()===username)){el('operatorFormMsg').textContent='Username già esistente.';return}sfOperators.push({id:uniqueId('op'),nome,cognome,username,password,telefono:el('opTelefono').value.trim(),mezzo:el('opMezzo').value,ruolo:el('opRuolo').value.trim()||'Operatore',active:true});saveOfficePeople();renderOfficePeople();['opNome','opCognome','opUsername','opPassword','opTelefono','opRuolo'].forEach(id=>el(id).value='');el('opMezzo').value='';el('operatorFormMsg').textContent='Operatore creato correttamente.'}
function editOperator(id){const o=sfOperators.find(x=>x.id===id);if(!o)return;const nome=prompt('Nome',o.nome);if(nome===null)return;const cognome=prompt('Cognome',o.cognome);if(cognome===null)return;const telefono=prompt('Telefono',o.telefono||'');if(telefono===null)return;const mezzo=prompt('Mezzo assegnato',o.mezzo||'');if(mezzo===null)return;const ruolo=prompt('Ruolo / note',o.ruolo||'Operatore');if(ruolo===null)return;Object.assign(o,{nome:nome.trim(),cognome:cognome.trim(),telefono:telefono.trim(),mezzo:mezzo.trim(),ruolo:ruolo.trim()});saveOfficePeople();renderOfficePeople()}
function changeOperatorPassword(id){const o=sfOperators.find(x=>x.id===id);if(!o)return;const p=prompt('Nuova password per '+operatorName(o));if(!p)return;o.password=p;saveOfficePeople();alert('Password aggiornata.')}
function toggleOperator(id){const o=sfOperators.find(x=>x.id===id);if(!o)return;o.active=o.active===false?true:false;saveOfficePeople();renderOfficePeople()}
function deleteOperator(id){const o=sfOperators.find(x=>x.id===id);if(!o)return;if(!confirm('Eliminare '+operatorName(o)+'?'))return;sfOperators=sfOperators.filter(x=>x.id!==id);sfTeams.forEach(t=>t.operatorIds=t.operatorIds.filter(x=>x!==id));saveOfficePeople();renderOfficePeople()}
function addTeam(){const name=el('teamName').value.trim();if(!name){el('teamFormMsg').textContent='Inserisci il nome della squadra.';return}const ids=[...document.querySelectorAll('.team-op-check:checked')].map(x=>x.value);sfTeams.push({id:uniqueId('team'),name,vehicle:el('teamVehicle').value,operatorIds:ids});saveOfficePeople();renderOfficePeople();el('teamName').value='';el('teamVehicle').value='';el('teamFormMsg').textContent='Squadra creata correttamente.'}
function editTeam(id){const t=sfTeams.find(x=>x.id===id);if(!t)return;const name=prompt('Nome squadra',t.name);if(name===null)return;const vehicle=prompt('Mezzo principale',t.vehicle||'');if(vehicle===null)return;const available=sfOperators.map((o,i)=>(i+1)+') '+operatorName(o)).join('\n'),current=t.operatorIds.map(id=>sfOperators.findIndex(o=>o.id===id)+1).filter(x=>x>0).join(','),selected=prompt('Numeri operatori separati da virgola:\n'+available,current);if(selected===null)return;const indexes=selected.split(',').map(x=>parseInt(x.trim(),10)-1).filter(x=>x>=0&&x<sfOperators.length);t.name=name.trim()||t.name;t.vehicle=vehicle.trim();t.operatorIds=[...new Set(indexes.map(i=>sfOperators[i].id))];saveOfficePeople();renderOfficePeople()}
function deleteTeam(id){const t=sfTeams.find(x=>x.id===id);if(!t)return;if(!confirm('Eliminare la squadra '+t.name+'?'))return;sfTeams=sfTeams.filter(x=>x.id!==id);saveOfficePeople();renderOfficePeople()}


/* ===== SPURGO FLOW 6.0 - OFFICE DATA LAYER ===== */
const DEFAULT_CLIENTS=[
 {id:'cl-belvedere',name:'Condominio Belvedere',address:'Via Roma 24',city:'Sarnico (BG)',phone:'035 1234567',email:'amministrazione@belvedere.test',contact:'Mario Rossi',notes:'4 pozzetti · autorimessa interrata'},
 {id:'cl-lago',name:'Ristorante Al Lago',address:'Lungolago',city:'Iseo (BS)',phone:'030 1234567',email:'info@allago.test',contact:'Responsabile sala',notes:'Fossa biologica'},
 {id:'cl-bianchi',name:'Azienda Bianchi Srl',address:'Via Industriale 8',city:'Costa Volpino (BG)',phone:'035 7654321',email:'manutenzione@bianchi.test',contact:'Ufficio tecnico',notes:'Rete industriale'}
];
const DEFAULT_VEHICLES=[
 {id:'veh-ab01',name:'Autobotte 01',code:'AB01',type:'Autobotte',capacity:'10 m³',status:'Operativa',hours:962,nextMaintenance:'1000 h',plate:'ZA 001 SF'},
 {id:'veh-ab02',name:'Autobotte 02',code:'AB02',type:'Autobotte',capacity:'8 m³',status:'Operativa',hours:688,nextMaintenance:'800 h',plate:'ZA 002 SF'},
 {id:'veh-fv01',name:'Furgone Video 01',code:'FV01',type:'Videoispezione',capacity:'',status:'Disponibile',hours:310,nextMaintenance:'22/10/2026',plate:'ZA 003 SF'}
];
const TODAY_2026='2026-08-12';
const DEFAULT_OFFICE_INTERVENTIONS=[
 {id:'INT-2026-00051',clientId:'cl-belvedere',client:'Condominio Belvedere',address:'Via Roma 24, Sarnico (BG)',request:'Disotturazione scarico garage',type:'Disotturazione',status:'Urgente',date:TODAY_2026,time:'10:30',operatorId:'op-marco',vehicleId:'veh-ab01',priority:'Urgente',notes:'Allagamento autorimessa',billing:'Da fatturare'},
 {id:'INT-2026-00050',clientId:'cl-lago',client:'Ristorante Al Lago',address:'Lungolago, Iseo (BS)',request:'Pulizia fossa biologica',type:'Spurgo',status:'In corso',date:TODAY_2026,time:'14:00',operatorId:'op-luca',vehicleId:'veh-ab02',priority:'Normale',notes:'Accesso dal retro',billing:'—'},
 {id:'INT-2026-00049',clientId:'cl-bianchi',client:'Azienda Bianchi Srl',address:'Via Industriale 8, Costa Volpino (BG)',request:'Lavaggio tubazione industriale',type:'Lavaggio',status:'Programmato',date:TODAY_2026,time:'16:30',operatorId:'op-marco',vehicleId:'veh-ab01',priority:'Normale',notes:'Contattare ufficio tecnico',billing:'—'}
];
const DEFAULT_MESSAGES=[
 {id:'msg-1',operatorId:'op-marco',from:'office',text:'Per Belvedere fotografa anche il tratto deformato per il preventivo.',ts:'2026-08-12T08:51:00',readByOperator:false,readByOffice:true},
 {id:'msg-2',operatorId:'op-marco',from:'office',text:'Terminato Belvedere passa direttamente al prossimo intervento assegnato.',ts:'2026-08-12T09:06:00',readByOperator:false,readByOffice:true},
 {id:'msg-3',operatorId:'op-luca',from:'operator',text:'Sono arrivato al Ristorante Al Lago.',ts:'2026-08-12T13:58:00',readByOperator:true,readByOffice:false}
];

let sfClients=loadJson('sf_v6_clients',DEFAULT_CLIENTS);
let sfVehicles=loadJson('sf_v6_vehicles',DEFAULT_VEHICLES);
let sfOfficeInterventions=loadJson('sf_v6_interventions',DEFAULT_OFFICE_INTERVENTIONS);
let sfMessages=loadJson('sf_v6_messages',DEFAULT_MESSAGES);
let officeMsgOperatorId=null;
let editingEntity={type:null,id:null};

function saveV6(){
 localStorage.setItem('sf_v6_clients',JSON.stringify(sfClients));
 localStorage.setItem('sf_v6_vehicles',JSON.stringify(sfVehicles));
 localStorage.setItem('sf_v6_interventions',JSON.stringify(sfOfficeInterventions));
 localStorage.setItem('sf_v6_messages',JSON.stringify(sfMessages));
}
function getOperator(id){return sfOperators.find(o=>o.id===id)}
function getVehicle(id){return sfVehicles.find(v=>v.id===id)}
function getClient(id){return sfClients.find(c=>c.id===id)}
function fmtDate(d){if(!d)return '—';const [y,m,day]=d.split('-');return `${day}/${m}/${y}`}
function statusClass(st){st=String(st||'').toLowerCase();if(st.includes('urgent'))return'urgent';if(st.includes('corso'))return'progress';if(st.includes('termin'))return'done';if(st.includes('annull'))return'cancelled';return'planned'}
function closeV6Modal(){el('v6Modal').classList.remove('active');editingEntity={type:null,id:null}}
function showV6Modal(title,body){el('v6ModalTitle').textContent=title;el('v6ModalBody').innerHTML=body;el('v6Modal').classList.add('active')}
function optionList(items,valueFn,labelFn,selected=''){return items.map(x=>`<option value="${esc(valueFn(x))}" ${valueFn(x)===selected?'selected':''}>${esc(labelFn(x))}</option>`).join('')}

function populateOfficeFilters(){
 const opHtml='<option value="">Tutti gli operatori</option>'+optionList(sfOperators,x=>x.id,x=>operatorName(x));
 ['intOperatorFilter','agendaOperator'].forEach(id=>{const n=el(id);if(n){const old=n.value;n.innerHTML=opHtml;n.value=old}});
}

function renderOfficeInterventions(){
 const host=el('officeInterventionList');if(!host)return;
 const q=(el('intSearch')?.value||'').toLowerCase(),st=el('intStatusFilter')?.value||'',op=el('intOperatorFilter')?.value||'';
 let rows=[...sfOfficeInterventions].sort((a,b)=>(b.date+b.time).localeCompare(a.date+a.time));
 rows=rows.filter(i=>(!q||[i.id,i.client,i.address,i.request].join(' ').toLowerCase().includes(q))&&(!st||i.status===st)&&(!op||i.operatorId===op));
 if(!rows.length){host.innerHTML='<div class="v6-empty">Nessun intervento corrispondente.</div>';return}
 host.innerHTML=rows.map(i=>{const o=getOperator(i.operatorId),v=getVehicle(i.vehicleId);return `<div class="v6-row">
  <div class="v6-row-head"><div><b>${esc(i.id)}</b> · <b>${esc(i.client)}</b><div class="v6-meta">${esc(i.address)} · ${fmtDate(i.date)} ${esc(i.time||'')}</div></div><span class="v6-status ${statusClass(i.status)}">${esc(i.status)}</span></div>
  <div class="v6-meta">${esc(i.type||'Intervento')} · ${esc(i.request||'')}<br>Operatore: <b>${esc(o?operatorName(o):'Da assegnare')}</b> · Mezzo: <b>${esc(v?v.name:'—')}</b></div>
  <div class="v6-row-actions"><button class="btn ghost" onclick="openInterventionModal('${i.id}')">Modifica</button><button class="btn ghost" onclick="duplicateIntervention('${i.id}')">Duplica</button><button class="btn primary" onclick="openConversationFor('${i.operatorId||''}')">Messaggio operatore</button><button class="btn danger" onclick="deleteIntervention('${i.id}')">Elimina</button></div>
 </div>`}).join('');
}

function openInterventionModal(id=null,agendaMode=false){
 const i=id?sfOfficeInterventions.find(x=>x.id===id):null;editingEntity={type:'intervention',id:id};
 const clients=optionList(sfClients,x=>x.id,x=>x.name,i?.clientId||'');
 const ops=optionList(sfOperators.filter(o=>o.active!==false),x=>x.id,x=>operatorName(x),i?.operatorId||'');
 const veh=optionList(sfVehicles,x=>x.id,x=>x.name,i?.vehicleId||'');
 showV6Modal(i?'Modifica intervento':'Nuovo intervento',`<div class="v6-form">
 <div><label>Cliente</label><select id="viClient" class="field" onchange="v6FillClientAddress()"><option value="">Seleziona cliente</option>${clients}</select></div>
 <div><label>Tipo</label><input id="viType" class="field" value="${esc(i?.type||'Spurgo')}" placeholder="Spurgo, lavaggio..."></div>
 <div class="full"><label>Indirizzo intervento</label><input id="viAddress" class="field" value="${esc(i?.address||'')}"></div>
 <div class="full"><label>Richiesta / descrizione</label><textarea id="viRequest" class="textarea">${esc(i?.request||'')}</textarea></div>
 <div><label>Data</label><input id="viDate" type="date" class="field" value="${esc(i?.date||TODAY_2026)}"></div>
 <div><label>Ora</label><input id="viTime" type="time" class="field" value="${esc(i?.time||'08:00')}"></div>
 <div><label>Stato</label><select id="viStatus" class="field">${['Programmato','Urgente','In corso','Terminato','Annullato'].map(x=>`<option ${i?.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
 <div><label>Priorità</label><select id="viPriority" class="field"><option ${i?.priority==='Normale'?'selected':''}>Normale</option><option ${i?.priority==='Urgente'?'selected':''}>Urgente</option></select></div>
 <div><label>Operatore</label><select id="viOperator" class="field"><option value="">Da assegnare</option>${ops}</select></div>
 <div><label>Mezzo</label><select id="viVehicle" class="field"><option value="">Nessuno</option>${veh}</select></div>
 <div class="full"><label>Note operative</label><textarea id="viNotes" class="textarea">${esc(i?.notes||'')}</textarea></div>
 </div><div class="panel-actions"><button class="btn ghost" onclick="closeV6Modal()">Annulla</button><button class="btn primary" onclick="saveIntervention()">Salva intervento</button></div>`);
}
function v6FillClientAddress(){const c=getClient(el('viClient').value);if(c&&!el('viAddress').value)el('viAddress').value=[c.address,c.city].filter(Boolean).join(', ')}
function saveIntervention(){
 const client=getClient(el('viClient').value),existing=editingEntity.id?sfOfficeInterventions.find(x=>x.id===editingEntity.id):null;
 if(!client){alert('Seleziona un cliente.');return}
 const data={clientId:client.id,client:client.name,address:el('viAddress').value.trim()||[client.address,client.city].join(', '),request:el('viRequest').value.trim(),type:el('viType').value.trim(),date:el('viDate').value,time:el('viTime').value,status:el('viStatus').value,priority:el('viPriority').value,operatorId:el('viOperator').value,vehicleId:el('viVehicle').value,notes:el('viNotes').value.trim(),billing:existing?.billing||'—'};
 if(existing)Object.assign(existing,data);else sfOfficeInterventions.unshift({id:'INT-2026-'+String(52+sfOfficeInterventions.length).padStart(5,'0'),...data});
 saveV6();closeV6Modal();renderAllOfficeV6();syncOperatorJobs();
}
function duplicateIntervention(id){const x=sfOfficeInterventions.find(i=>i.id===id);if(!x)return;const c={...x,id:'INT-2026-'+String(100+sfOfficeInterventions.length).padStart(5,'0'),status:'Programmato',time:'08:00'};sfOfficeInterventions.unshift(c);saveV6();renderAllOfficeV6()}
function deleteIntervention(id){if(!confirm('Eliminare questo intervento?'))return;sfOfficeInterventions=sfOfficeInterventions.filter(i=>i.id!==id);saveV6();renderAllOfficeV6();syncOperatorJobs()}

function renderOfficeAgenda(){
 const host=el('officeAgendaList');if(!host)return;
 const d=el('agendaDate')?.value||TODAY_2026,op=el('agendaOperator')?.value||'';
 const rows=sfOfficeInterventions.filter(i=>i.date===d&&(!op||i.operatorId===op)).sort((a,b)=>(a.time||'').localeCompare(b.time||''));
 if(!rows.length){host.innerHTML='<div class="v6-empty">Nessun appuntamento per la giornata selezionata.</div>';return}
 host.innerHTML=rows.map(i=>{const o=getOperator(i.operatorId),v=getVehicle(i.vehicleId);return `<div class="v6-row v6-agenda-day"><div class="v6-time">${esc(i.time||'—')}</div><div><div class="v6-row-head"><b>${esc(i.client)}</b><span class="v6-status ${statusClass(i.status)}">${esc(i.status)}</span></div><div class="v6-meta">${esc(i.address)}<br>${esc(i.request)} · ${esc(o?operatorName(o):'Da assegnare')} · ${esc(v?v.code:'—')}</div><div class="v6-row-actions"><button class="btn ghost" onclick="openInterventionModal('${i.id}')">Apri</button></div></div></div>`}).join('');
}

function openClientModal(id=null){
 const c=id?getClient(id):null;editingEntity={type:'client',id};
 showV6Modal(c?'Modifica cliente':'Nuovo cliente',`<div class="v6-form">
 <div class="full"><label>Ragione sociale / nome</label><input id="vcName" class="field" value="${esc(c?.name||'')}"></div>
 <div><label>Via / civico</label><input id="vcAddress" class="field" value="${esc(c?.address||'')}"></div><div><label>Comune</label><input id="vcCity" class="field" value="${esc(c?.city||'')}"></div>
 <div><label>Telefono</label><input id="vcPhone" class="field" value="${esc(c?.phone||'')}"></div><div><label>E-mail</label><input id="vcEmail" class="field" value="${esc(c?.email||'')}"></div>
 <div class="full"><label>Referente</label><input id="vcContact" class="field" value="${esc(c?.contact||'')}"></div>
 <div class="full"><label>Impianti / note</label><textarea id="vcNotes" class="textarea">${esc(c?.notes||'')}</textarea></div>
 </div><div class="panel-actions"><button class="btn ghost" onclick="closeV6Modal()">Annulla</button><button class="btn primary" onclick="saveClient()">Salva cliente</button></div>`);
}
function saveClient(){const existing=editingEntity.id?getClient(editingEntity.id):null,data={name:el('vcName').value.trim(),address:el('vcAddress').value.trim(),city:el('vcCity').value.trim(),phone:el('vcPhone').value.trim(),email:el('vcEmail').value.trim(),contact:el('vcContact').value.trim(),notes:el('vcNotes').value.trim()};if(!data.name){alert('Inserisci il nome cliente.');return}if(existing)Object.assign(existing,data);else sfClients.push({id:uniqueId('cl'),...data});saveV6();closeV6Modal();renderClients()}
function deleteClient(id){if(sfOfficeInterventions.some(i=>i.clientId===id)){alert('Cliente collegato a interventi: non può essere eliminato.');return}if(confirm('Eliminare cliente?')){sfClients=sfClients.filter(c=>c.id!==id);saveV6();renderClients()}}
function renderClients(){const host=el('clientList');if(!host)return;const q=(el('clientSearch')?.value||'').toLowerCase();const list=sfClients.filter(c=>!q||[c.name,c.address,c.city,c.phone,c.contact].join(' ').toLowerCase().includes(q));host.innerHTML=list.length?list.map(c=>{const n=sfOfficeInterventions.filter(i=>i.clientId===c.id).length;return `<div class="v6-card"><h3>${esc(c.name)}</h3><div>${esc(c.address)} · ${esc(c.city)}</div><div class="v6-meta">${esc(c.phone||'')} · ${esc(c.email||'')}<br>Referente: ${esc(c.contact||'—')}<br>${esc(c.notes||'')}</div><div class="v6-meta"><b>${n}</b> interventi registrati</div><div class="v6-row-actions"><button class="btn ghost" onclick="openClientModal('${c.id}')">Modifica</button><button class="btn primary" onclick="newInterventionForClient('${c.id}')">Nuovo intervento</button><button class="btn danger" onclick="deleteClient('${c.id}')">Elimina</button></div></div>`}).join(''):'<div class="v6-empty">Nessun cliente.</div>'}
function newInterventionForClient(id){openInterventionModal();setTimeout(()=>{el('viClient').value=id;v6FillClientAddress()},20)}

function openVehicleModal(id=null){
 const v=id?getVehicle(id):null;editingEntity={type:'vehicle',id};
 showV6Modal(v?'Modifica mezzo':'Nuovo mezzo',`<div class="v6-form">
 <div><label>Nome mezzo</label><input id="vvName" class="field" value="${esc(v?.name||'')}"></div><div><label>Codice</label><input id="vvCode" class="field" value="${esc(v?.code||'')}"></div>
 <div><label>Tipologia</label><input id="vvType" class="field" value="${esc(v?.type||'Autobotte')}"></div><div><label>Targa</label><input id="vvPlate" class="field" value="${esc(v?.plate||'')}"></div>
 <div><label>Capacità</label><input id="vvCapacity" class="field" value="${esc(v?.capacity||'')}"></div><div><label>Stato</label><select id="vvStatus" class="field">${['Operativa','Disponibile','In intervento','Manutenzione','Fuori servizio'].map(x=>`<option ${v?.status===x?'selected':''}>${x}</option>`).join('')}</select></div>
 <div><label>Ore/km</label><input id="vvHours" class="field" type="number" value="${esc(v?.hours??0)}"></div><div><label>Prossima manutenzione</label><input id="vvMaintenance" class="field" value="${esc(v?.nextMaintenance||'')}"></div>
 </div><div class="panel-actions"><button class="btn ghost" onclick="closeV6Modal()">Annulla</button><button class="btn primary" onclick="saveVehicle()">Salva mezzo</button></div>`);
}
function saveVehicle(){const existing=editingEntity.id?getVehicle(editingEntity.id):null,data={name:el('vvName').value.trim(),code:el('vvCode').value.trim(),type:el('vvType').value.trim(),plate:el('vvPlate').value.trim(),capacity:el('vvCapacity').value.trim(),status:el('vvStatus').value,hours:Number(el('vvHours').value||0),nextMaintenance:el('vvMaintenance').value.trim()};if(!data.name){alert('Inserisci il nome del mezzo.');return}if(existing)Object.assign(existing,data);else sfVehicles.push({id:uniqueId('veh'),...data});saveV6();closeV6Modal();renderVehicles();refreshVehicleSelects()}
function deleteVehicle(id){if(sfOfficeInterventions.some(i=>i.vehicleId===id)){alert('Mezzo assegnato a interventi: rimuovi prima le assegnazioni.');return}if(confirm('Eliminare mezzo?')){sfVehicles=sfVehicles.filter(v=>v.id!==id);saveV6();renderVehicles();refreshVehicleSelects()}}
function renderVehicles(){const host=el('vehicleList');if(!host)return;host.innerHTML=sfVehicles.map(v=>{const ints=sfOfficeInterventions.filter(i=>i.vehicleId===v.id&&i.date===TODAY_2026);return `<div class="v6-card"><h3>${esc(v.name)}</h3><div class="v6-meta">${esc(v.code)} · ${esc(v.type)} · ${esc(v.plate||'')}</div><p>Stato: <b>${esc(v.status)}</b></p><p>Capacità: ${esc(v.capacity||'—')} · Ore/km: ${esc(v.hours)}</p><p>Manutenzione: ${esc(v.nextMaintenance||'—')}</p><div class="v6-meta">Interventi oggi: ${ints.length}</div><div class="v6-row-actions"><button class="btn ghost" onclick="openVehicleModal('${v.id}')">Modifica</button><button class="btn danger" onclick="deleteVehicle('${v.id}')">Elimina</button></div></div>`}).join('')}
function refreshVehicleSelects(){const selects=['opMezzo','teamVehicle'];selects.forEach(id=>{const n=el(id);if(n){const old=n.value;n.innerHTML='<option value="">Nessuno</option>'+sfVehicles.map(v=>`<option>${esc(v.name)}</option>`).join('');n.value=old}})}

function renderDashboardV6(){
 const today=sfOfficeInterventions.filter(i=>i.date===TODAY_2026),inprog=today.filter(i=>i.status==='In corso').length,done=today.filter(i=>i.status==='Terminato').length;
 const k=el('dashboard')?.querySelectorAll('.kpi strong');if(k?.length>=5){k[0].textContent=today.length;k[1].textContent=inprog;k[2].textContent=done;k[3].textContent=sfTeams.length;k[4].textContent=sfOfficeInterventions.filter(i=>i.billing==='Da fatturare').length}
}

function refreshOperatorAreaData(){
 renderOfficePeople();refreshVehicleSelects();populateOfficeFilters();
}
const _oldRenderOfficePeople=renderOfficePeople;
renderOfficePeople=function(){_oldRenderOfficePeople();refreshVehicleSelects();populateOfficeFilters();renderOfficeMessagesUsers();};

function openConversationFor(operatorId){
 if(!operatorId){alert('Intervento non assegnato a un operatore.');return}
 officeMsgOperatorId=operatorId;
 const btn=[...document.querySelectorAll('#menu button')].find(b=>b.dataset.sec==='messaggiUfficio');if(btn)btn.click();
 setTimeout(()=>renderOfficeThread(),20);
}
function renderOfficeMessagesUsers(){
 const host=el('officeMsgUsers');if(!host)return;
 host.innerHTML=sfOperators.filter(o=>o.active!==false).map(o=>{const unread=sfMessages.filter(m=>m.operatorId===o.id&&m.from==='operator'&&!m.readByOffice).length;return `<div class="msg-user ${officeMsgOperatorId===o.id?'active':''}" onclick="selectOfficeMsgUser('${o.id}')"><b>${esc(operatorName(o))}</b><div class="v6-meta">${esc(o.ruolo||'Operatore')} ${unread?`· 🔴 ${unread} nuovi`:''}</div></div>`}).join('');
 updateMessageBadges();
}
function selectOfficeMsgUser(id){officeMsgOperatorId=id;renderOfficeMessagesUsers();renderOfficeThread()}
function renderOfficeThread(){
 const stream=el('officeMsgStream');if(!stream)return;
 const o=getOperator(officeMsgOperatorId);if(!o){stream.innerHTML='<div class="v6-empty">Seleziona un operatore.</div>';return}
 el('officeMsgTitle').textContent=operatorName(o);el('officeMsgSubtitle').textContent='@'+o.username+' · '+(o.mezzo||'nessun mezzo');
 const msgs=sfMessages.filter(m=>m.operatorId===o.id).sort((a,b)=>a.ts.localeCompare(b.ts));
 stream.innerHTML=msgs.length?msgs.map(m=>`<div class="msg-bubble ${m.from==='office'?'office':'operator'}">${esc(m.text)}<small>${m.from==='office'?'Ufficio':operatorName(o)} · ${new Date(m.ts).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>`).join(''):'<div class="v6-empty">Nessun messaggio.</div>';
 stream.scrollTop=stream.scrollHeight;
 sfMessages.forEach(m=>{if(m.operatorId===o.id&&m.from==='operator')m.readByOffice=true});saveV6();updateMessageBadges();
}
function sendOfficeMessage(){const text=el('officeMsgText').value.trim();if(!officeMsgOperatorId){alert('Seleziona un operatore.');return}if(!text)return;sfMessages.push({id:uniqueId('msg'),operatorId:officeMsgOperatorId,from:'office',text,ts:new Date().toISOString(),readByOperator:false,readByOffice:true});el('officeMsgText').value='';saveV6();renderOfficeThread()}
function markThreadRead(){if(!officeMsgOperatorId)return;sfMessages.forEach(m=>{if(m.operatorId===officeMsgOperatorId&&m.from==='operator')m.readByOffice=true});saveV6();renderOfficeThread()}

function currentOperatorId(){return sessionStorage.getItem('sf_current_operator_id')||''}
function renderOperatorMessages(){
 const stream=el('operatorMsgStream');if(!stream)return;const id=currentOperatorId(),o=getOperator(id);
 const msgs=sfMessages.filter(m=>m.operatorId===id).sort((a,b)=>a.ts.localeCompare(b.ts));
 stream.innerHTML=msgs.length?msgs.map(m=>`<div class="msg-bubble ${m.from==='operator'?'office':'operator'}">${esc(m.text)}<small>${m.from==='office'?'Ufficio':operatorName(o)} · ${new Date(m.ts).toLocaleString('it-IT',{day:'2-digit',month:'2-digit',hour:'2-digit',minute:'2-digit'})}</small></div>`).join(''):'<div class="v6-empty">Nessun messaggio dall’ufficio.</div>';
 sfMessages.forEach(m=>{if(m.operatorId===id&&m.from==='office')m.readByOperator=true});saveV6();stream.scrollTop=stream.scrollHeight;updateMessageBadges();
}
function sendOperatorMessage(){const id=currentOperatorId(),text=el('operatorMsgText').value.trim();if(!id||!text)return;sfMessages.push({id:uniqueId('msg'),operatorId:id,from:'operator',text,ts:new Date().toISOString(),readByOperator:true,readByOffice:false});el('operatorMsgText').value='';saveV6();renderOperatorMessages()}
function updateMessageBadges(){
 const officeUnread=sfMessages.filter(m=>m.from==='operator'&&!m.readByOffice).length;if(el('officeMsgBadge'))el('officeMsgBadge').textContent=officeUnread;
 const id=currentOperatorId(),operatorUnread=sfMessages.filter(m=>m.operatorId===id&&m.from==='office'&&!m.readByOperator).length;if(el('operatorMsgBadge'))el('operatorMsgBadge').textContent=operatorUnread;
 const navBadge=document.querySelector('#fieldNav [data-page="Messaggi"] .badge-nav');if(navBadge)navBadge.textContent=operatorUnread;
}
function syncOperatorJobs(){
 // Replace operator job picker using assignments for currently logged-in operator.
 const id=currentOperatorId(),host=el('jobPicker');if(!host||!id)return;
 const assigned=sfOfficeInterventions.filter(i=>i.operatorId===id&&i.status!=='Terminato'&&i.status!=='Annullato');
 host.innerHTML=assigned.length?assigned.map((i,idx)=>`<div class="job-choice ${idx===0?'selected':''}" data-id="${esc(i.id)}" data-client="${esc(i.client)}" data-address="${esc(i.address)}" data-request="${esc(i.request)}" onclick="selectOfficeAssignedJob(this,'${i.id}')"><div class="row"><b>${esc(i.client)}</b><span class="badge ${i.status==='Urgente'?'urgent':'planned'}">${esc(i.status.toUpperCase())}</span></div><small>${esc(i.time||'')} · ${esc(i.address)}</small></div>`).join(''):'<div class="v6-empty" style="background:white;border-radius:12px">Nessun intervento assegnato.</div>';
 if(assigned[0])selectOfficeAssignedJob(host.querySelector('.job-choice'),assigned[0].id);
 renderOperatorAgendaFromOffice();
}
function selectOfficeAssignedJob(node,id){document.querySelectorAll('.job-choice').forEach(x=>x.classList.remove('selected'));if(node)node.classList.add('selected');const i=sfOfficeInterventions.find(x=>x.id===id);if(!i)return;selectedJob={id:i.id,client:i.client,address:i.address,request:i.request,lat:i.lat??null,lng:i.lng??null,operatorId:i.operatorId,vehicleId:i.vehicleId};el('selectedClient').textContent=i.client;el('selectedAddress').textContent=i.address;el('selectedRequest').textContent=i.request;if(el('jobAddressInput'))el('jobAddressInput').value=i.address;updateSelectedJobMap()}
function renderOperatorAgendaFromOffice(){
 const host=el('fieldAgenda');if(!host)return;const id=currentOperatorId(),rows=sfOfficeInterventions.filter(i=>i.operatorId===id).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));
 host.innerHTML='<h2>Agenda giornaliera</h2><p class="muted" style="color:#c8d6e2">Interventi assegnati dall’Ufficio.</p>'+rows.map(i=>`<div class="day-item agenda-selectable" onclick="fieldNavigate('Interventi');setTimeout(()=>{const n=[...document.querySelectorAll('.job-choice')].find(x=>x.dataset.id==='${i.id}');if(n)selectOfficeAssignedJob(n,'${i.id}')},50)"><small>${fmtDate(i.date)} · ${esc(i.time||'')} · ${esc(i.status.toUpperCase())}</small><b>${esc(i.client)}</b>${esc(i.address)} · ${esc(i.request)}</div>`).join('');
}
function renderAllOfficeV6(){populateOfficeFilters();renderOfficeInterventions();renderOfficeAgenda();renderClients();renderVehicles();renderOfficeMessagesUsers();renderDashboardV6()}


let prevView='office', timerInt, secs=0;

const el = id => document.getElementById(id);

function login(){
  const u=el('user').value.trim().toLowerCase();
  const p=el('pass').value;
  const loginScreen=el('login'),officeView=el('office'),operatorView=el('operator'),opName=el('opname');
  if(u==='ufficio'&&p==='ufficio123'){
    loginScreen.classList.add('hidden');
    officeView.classList.remove('hidden');
    operatorView.classList.add('hidden');
    renderOfficePeople();renderAllOfficeV6();
    setTimeout(()=>renderOfficeMap(),140);
    return;
  }
  const matchedOperator=sfOperators.find(o=>o.active!==false&&o.username.toLowerCase()===u&&o.password===p);
  if(matchedOperator){
    loginScreen.classList.add('hidden');
    officeView.classList.add('hidden');
    operatorView.classList.remove('hidden');
    const fullName=operatorName(matchedOperator);
    opName.textContent='Operatore: '+fullName;
    if(el('profileName'))el('profileName').textContent=fullName;
    if(el('nomeOperatoreFirma'))el('nomeOperatoreFirma').value=fullName;const prof=el('fieldProfilo');if(prof){const pv=prof.querySelector('.profile-item');if(pv)pv.innerHTML='<b>'+esc(fullName)+'</b><p>Stato: 🟢 In servizio</p><p>Mezzo assegnato: '+esc(matchedOperator.mezzo||'Nessuno')+'</p>';}
    sessionStorage.setItem('sf_current_operator_id',matchedOperator.id);
    syncOperatorJobs();renderOperatorMessages();updateMessageBadges();
    setTimeout(()=>{setupSignature('firmaOperatore');setupSignature('firmaCliente');updateSelectedJobMap()},140);
    return;
  }
  alert('Credenziali demo non valide');
}

function logout(){
  location.reload();
}

document.querySelectorAll('#menu button').forEach(b=>{
  b.addEventListener('click', ()=>{
    document.querySelectorAll('#menu button').forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    document.querySelectorAll('.section').forEach(s=>s.classList.remove('active'));
    const target = el(b.dataset.sec);
    if(target) target.classList.add('active');
    if(b.dataset.sec==='dashboard'){renderDashboardV6();setTimeout(()=>renderOfficeMap(),80)}
    if(b.dataset.sec==='control')setTimeout(()=>renderControlMap(),80);
    if(b.dataset.sec==='interventi')renderOfficeInterventions();
    if(b.dataset.sec==='agenda')renderOfficeAgenda();
    if(b.dataset.sec==='clienti')renderClients();
    if(b.dataset.sec==='flotta')renderVehicles();
    if(b.dataset.sec==='squadre')renderOfficePeople();
    if(b.dataset.sec==='messaggiUfficio'){renderOfficeMessagesUsers();renderOfficeThread();}
  });
});




let jobRunning=false;


let officeMapObj=null, controlMapObj=null, fieldMapObj=null, selectedMapObj=null, reportMapObj=null;
const demoJobs=[
 {id:'INT-2024-00045',client:'Condominio Belvedere',address:'Via Roma 24, 24067 Sarnico (BG), Italia',request:'Intasamento scarico garage',lat:null,lng:null,status:'Urgente',coordSource:'address'},
 {id:'INT-2024-00046',client:'Ristorante Al Lago',address:'Lungolago, Iseo (BS), Italia',request:'Pulizia fossa biologica',lat:null,lng:null,status:'Programmato',coordSource:'address'},
 {id:'INT-2024-00047',client:'Azienda Bianchi Srl',address:'Costa Volpino (BG), Italia',request:'Lavaggio tubazione',lat:null,lng:null,status:'Programmato',coordSource:'address'}
];
const completedSeed=[
 {id:'INT-2024-00044',client:'Residence Sole',address:'Via XX Settembre 8, Iseo (BS), Italia',request:'Pulizia pozzetti',lat:null,lng:null,status:'Terminato',closedAt:'12/08/2026 09:05',reportNo:'2024-00044',coordSource:'address'}
];
let completedJobs=[...completedSeed];
function mapVisible(id){
 const n=el(id); if(!n) return false;
 const r=n.getBoundingClientRect(); return n.offsetParent!==null && r.width>20 && r.height>20;
}
function setMapHealth(id,text,ok=true){const h=el(id+'Health');if(h){h.textContent=text;h.className='map-health '+(ok?'ok':'err')}}
function makeLeafletMap(id, center, zoom=12, jobs=[]){
 const node=el(id); if(!node || typeof L==='undefined' || !mapVisible(id)) return null;
 let map=node._leaflet_map_instance;
 if(!map){
   node.innerHTML=''; node._leaflet_id=null;
   map=L.map(id,{zoomControl:true,scrollWheelZoom:false,tap:true,trackResize:true}).setView(center,zoom);
   node._leaflet_map_instance=map;
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'&copy; OpenStreetMap',updateWhenIdle:true,keepBuffer:3}).addTo(map);
   map._sfLayer=L.layerGroup().addTo(map);
 }
 if(!map._sfLayer) map._sfLayer=L.layerGroup().addTo(map);
 map._sfLayer.clearLayers();
 const bounds=[];
 jobs.forEach(j=>{const coords=activeCoords(j);if(!coords)return;L.marker(coords).addTo(map._sfLayer).bindPopup('<b>'+esc(j.client)+'</b><br>'+esc(j.address||'')+'<br>'+esc(j.status||''));bounds.push(coords)});
 if(bounds.length===1) map.setView(bounds[0],zoom,{animate:false});
 else if(bounds.length>1) map.fitBounds(bounds,{padding:[28,28],maxZoom:13,animate:false});
 requestAnimationFrame(()=>map.invalidateSize(true));
 setTimeout(()=>map.invalidateSize(true),80); setTimeout(()=>map.invalidateSize(true),260);
 setMapHealth(id,'Mappa caricata',true);
 return map;
}


let manualPointMode=false;
let addressMarker=null, operationalMarker=null;

function activeCoords(job=selectedJob){
  if(job && Number.isFinite(job.opLat) && Number.isFinite(job.opLng)) return [job.opLat,job.opLng];
  if(job && Number.isFinite(job.lat) && Number.isFinite(job.lng)) return [job.lat,job.lng];
  return null;
}
function setLocationStatus(text,type=''){
  const x=el('locationStatus'); if(!x) return;
  x.textContent=text; x.className='location-status'+(type?' '+type:'');
}
function updateOperationalPointLabel(){
  const host=el('operationalPointLabel'); if(!host) return;
  if(Number.isFinite(selectedJob.opLat)&&Number.isFinite(selectedJob.opLng)){
    host.innerHTML='<span class="point-chip">🎯 Punto operativo: '+selectedJob.opLat.toFixed(6)+', '+selectedJob.opLng.toFixed(6)+'</span>';
  }else{
    host.innerHTML='';
  }
}
async function geocodeAddress(address){
 const q=(address||'').trim(); if(!q) throw new Error('Inserisci un indirizzo.');
 const key='sf_geo_'+q.toLowerCase();
 try{const c=JSON.parse(localStorage.getItem(key)||'null');if(c&&Number.isFinite(c.lat)&&Number.isFinite(c.lng))return c}catch(e){}
 const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&countrycodes=it&accept-language=it&q='+encodeURIComponent(q);
 const res=await fetch(url,{headers:{'Accept':'application/json'}}); if(!res.ok) throw new Error('Servizio di geolocalizzazione non disponibile.');
 const data=await res.json(); if(!data.length) throw new Error('Indirizzo non trovato. Verifica via, civico e comune.');
 const out={lat:parseFloat(data[0].lat),lng:parseFloat(data[0].lon),displayName:data[0].display_name};
 try{localStorage.setItem(key,JSON.stringify(out))}catch(e){} return out;
}
async function geocodeJob(job, silent=false){
  if(!job || !job.address) return false;
  try{
    if(!silent) setLocationStatus('Ricerca posizione in corso…');
    const g=await geocodeAddress(job.address);
    job.lat=g.lat; job.lng=g.lng; job.coordSource='geocoded'; job.geocodedLabel=g.displayName;
    if(!silent) setLocationStatus('Posizione trovata: '+g.displayName,'ok');
    return true;
  }catch(err){
    if(!silent) setLocationStatus(err.message||'Posizione non trovata.','err');
    return false;
  }
}
async function geocodeSelectedJob(){
  const input=el('jobAddressInput');
  selectedJob.address=(input?input.value:selectedJob.address).trim();
  el('selectedAddress').textContent=selectedJob.address;
  selectedJob.opLat=null; selectedJob.opLng=null;
  const ok=await geocodeJob(selectedJob,false);
  if(ok){
    const source=demoJobs.find(j=>j.id===selectedJob.id);
    if(source) Object.assign(source,selectedJob);
    updateSelectedJobMap();
    if(fieldMapObj) refreshFieldMap();
  }
  updateOperationalPointLabel();
}
async function geocodeAllDemoJobs(){
  for(const j of demoJobs){
    if(!Number.isFinite(j.lat)||!Number.isFinite(j.lng)){
      await geocodeJob(j,true);
      await new Promise(r=>setTimeout(r,1100)); // rispetta il rate-limit demo del servizio pubblico
    }
  }
  for(const j of completedJobs){
    if(!Number.isFinite(j.lat)||!Number.isFinite(j.lng)){
      await geocodeJob(j,true);
      await new Promise(r=>setTimeout(r,1100));
    }
  }
}
function useDevicePosition(){
 if(!window.isSecureContext){setLocationStatus('Il GPS richiede HTTPS.','err');return}
 if(!navigator.geolocation){setLocationStatus('Geolocalizzazione non supportata.','err');return}
 setLocationStatus('Acquisizione GPS ad alta precisione…');
 navigator.geolocation.getCurrentPosition(pos=>{
   selectedJob.opLat=pos.coords.latitude;selectedJob.opLng=pos.coords.longitude;selectedJob.gpsAccuracy=pos.coords.accuracy;selectedJob.coordSource='device';
   setLocationStatus('GPS acquisito · precisione ±'+Math.round(pos.coords.accuracy)+' m','ok');updateOperationalPointLabel();updateSelectedJobMap();
 },err=>{const m=err.code===1?'Permesso posizione negato.':err.code===2?'Posizione non disponibile.':'Tempo scaduto durante la ricerca GPS.';setLocationStatus(m,'err')},{enableHighAccuracy:true,timeout:15000,maximumAge:0});
}
function toggleManualPoint(){
  manualPointMode=!manualPointMode;
  const mapNode=el('selectedJobMap');
  const btn=el('manualPointBtn');
  if(mapNode) mapNode.classList.toggle('manual-mode',manualPointMode);
  if(btn) btn.textContent=manualPointMode?'✓ Tocca la mappa nel punto corretto':'🎯 Correggi punto operativo';
  setLocationStatus(manualPointMode?'Tocca la mappa nel punto esatto in cui deve arrivare la squadra.':'Correzione manuale disattivata.',manualPointMode?'':'ok');
}
function clearOperationalPoint(){
  selectedJob.opLat=null; selectedJob.opLng=null;
  selectedJob.coordSource='geocoded';
  manualPointMode=false;
  const mapNode=el('selectedJobMap'); if(mapNode) mapNode.classList.remove('manual-mode');
  const btn=el('manualPointBtn'); if(btn) btn.textContent='🎯 Correggi punto operativo';
  updateOperationalPointLabel();
  updateSelectedJobMap();
  setLocationStatus('Ripristinato il punto dell’indirizzo.','ok');
}
async function ensureCoords(list){
 for(const j of list){if(!Number.isFinite(j.lat)||!Number.isFinite(j.lng)){await geocodeJob(j,true);await new Promise(r=>setTimeout(r,1050))}}
 return list.filter(j=>activeCoords(j));
}
async function renderOfficeMap(){if(!mapVisible('officeMap'))return;const valid=await ensureCoords([...demoJobs,...completedJobs]);officeMapObj=makeLeafletMap('officeMap',valid.length?activeCoords(valid[0]):[45.67,9.96],10,valid)}
async function renderControlMap(){if(!mapVisible('controlMap'))return;const valid=await ensureCoords([...demoJobs,...completedJobs]);controlMapObj=makeLeafletMap('controlMap',valid.length?activeCoords(valid[0]):[45.67,9.96],10,valid)}
async function refreshFieldMap(){if(!mapVisible('fieldRealMap'))return;const valid=await ensureCoords(demoJobs);fieldMapObj=makeLeafletMap('fieldRealMap',valid.length?activeCoords(valid[0]):[45.67,9.96],11,valid)}
function invalidateVisibleMaps(){[officeMapObj,controlMapObj,fieldMapObj,selectedMapObj,reportMapObj].forEach(m=>{if(m){requestAnimationFrame(()=>m.invalidateSize(true));setTimeout(()=>m.invalidateSize(true),100)}})}
function fitFieldMap(){if(fieldMapObj){const pts=demoJobs.map(activeCoords).filter(Boolean);if(pts.length>1)fieldMapObj.fitBounds(pts,{padding:[28,28],maxZoom:13});else if(pts[0])fieldMapObj.setView(pts[0],15)}}
function centerMapOnSelected(){if(fieldMapObj){const c=activeCoords(selectedJob);if(c)fieldMapObj.setView(c,15)}}
function centerSelectedMap(){const c=activeCoords(selectedJob);if(selectedMapObj&&c)selectedMapObj.setView(c,16)}
function selectJobFromAgenda(id){
 const node=[...document.querySelectorAll('.job-choice')].find(x=>x.dataset.id===id);
 if(node) selectJob(node);
 fieldNavigate('Interventi');
 setTimeout(()=>{
   const card=el('selectedJobCard');
   if(card) card.scrollIntoView({behavior:'smooth',block:'start'});
   updateSelectedJobMap();
 },100);
}
function openCompletedByAgenda(id){
 fieldNavigate('Interventi');
 setTimeout(()=>reopenCompletedJob(id),80);
}
function renderCompletedJobs(){
 const host=el('completedJobs'); if(!host) return;
 if(!completedJobs.length){
   host.innerHTML='<div class="muted" style="color:#c8d6e2">Nessun intervento terminato.</div>';
   return;
 }
 host.innerHTML=completedJobs.map(j=>`
   <div class="completed-job">
     <div class="head"><div><b>${j.client}</b><br><small>${j.address}</small></div><span class="completed-chip">TERMINATO</span></div>
     <div class="muted">${j.request} · ${j.closedAt||''}</div>
     <div class="actions">
       <button class="btn ghost" onclick="viewCompletedReport('${j.id}')">Apri rapportino</button>
       <button class="btn primary" onclick="reopenCompletedJob('${j.id}')">Riapri / modifica</button>
     </div>
   </div>`).join('');
}
async function viewCompletedReport(id){
 const j=completedJobs.find(x=>x.id===id); if(!j) return;
 selectedJob={...j};
 if(!Number.isFinite(selectedJob.lat)||!Number.isFinite(selectedJob.lng)) await geocodeJob(selectedJob,true);
 populateReportFromSelected();
 showReport();
}
async function reopenCompletedJob(id){
 const j=completedJobs.find(x=>x.id===id); if(!j) return;
 selectedJob={...j};
 if(!Number.isFinite(selectedJob.lat)||!Number.isFinite(selectedJob.lng)) await geocodeJob(selectedJob,true);
 completedJobs=completedJobs.filter(x=>x.id!==id);
 renderCompletedJobs();
 el('selectedClient').textContent=selectedJob.client;
 el('selectedAddress').textContent=selectedJob.address;
 el('selectedRequest').textContent=selectedJob.request;
 el('jobPicker').style.display='none';
 el('job').classList.remove('hidden');
 el('startBtn').disabled=true;
 el('startBtn').textContent='Intervento riaperto';
 jobRunning=true;
 sessionStorage.setItem('sf_job_running','1');
 sessionStorage.setItem('sf_selected_job',JSON.stringify(selectedJob));
 const oldNotice=el('reopenNotice'); if(oldNotice) oldNotice.remove();
 el('job').insertAdjacentHTML('afterbegin','<div id="reopenNotice" class="edit-note">Intervento terminato riaperto per modifiche. Al termine usa “Termina e genera rapportino” per creare una nuova versione del documento.</div>');
 updateSelectedJobMap();
 setTimeout(()=>el('job').scrollIntoView({behavior:'smooth',block:'start'}),100);
}
function populateReportFromSelected(){
 if(el('reportRichiesta')) el('reportRichiesta').textContent=selectedJob.request||'';
 if(el('reportClientName')) el('reportClientName').textContent=selectedJob.client||'';
 if(el('reportClientAddress')) el('reportClientAddress').innerHTML=(selectedJob.address||'').replace(', ','<br>')+' – Italia';
 if(el('reportComune')) el('reportComune').textContent=(selectedJob.address||'')+' – Italia';
 const rc=activeCoords(selectedJob);
 if(el('reportLat')) el('reportLat').textContent=rc?Number(rc[0]).toFixed(4):'—';
 if(el('reportLng')) el('reportLng').textContent=rc?Number(rc[1]).toFixed(4):'—';
 if(el('reportNumber')) el('reportNumber').textContent='N. '+String(selectedJob.reportNo||selectedJob.id||'').replace('INT-','');
 if(el('reportPointType')) el('reportPointType').textContent=(Number.isFinite(selectedJob.opLat)&&Number.isFinite(selectedJob.opLng))?'Punto operativo corretto':'Coordinate dell’indirizzo';
 setTimeout(updateReportMap,120);
}

async function initAllMaps(){
 if(el('jobAddressInput'))el('jobAddressInput').value=selectedJob.address||'';
 if(mapVisible('officeMap'))await renderOfficeMap();
 if(mapVisible('controlMap'))await renderControlMap();
 if(mapVisible('fieldRealMap'))await refreshFieldMap();
 if(mapVisible('selectedJobMap')){
   if(!activeCoords(selectedJob))await geocodeJob(selectedJob,true);
   updateSelectedJobMap();
 }
}
async function updateSelectedJobMap(){
 if(!mapVisible('selectedJobMap'))return;
 let addressCoords=(Number.isFinite(selectedJob.lat)&&Number.isFinite(selectedJob.lng))?[selectedJob.lat,selectedJob.lng]:null;
 if(!addressCoords && selectedJob.address){await geocodeJob(selectedJob,true);addressCoords=(Number.isFinite(selectedJob.lat)&&Number.isFinite(selectedJob.lng))?[selectedJob.lat,selectedJob.lng]:null}
 const opCoords=(Number.isFinite(selectedJob.opLat)&&Number.isFinite(selectedJob.opLng))?[selectedJob.opLat,selectedJob.opLng]:null;
 const center=opCoords||addressCoords||[45.67,9.96];
 if(!selectedMapObj){selectedMapObj=makeLeafletMap('selectedJobMap',center,addressCoords||opCoords?16:12,[]);if(!selectedMapObj){setMapHealth('selectedJobMap','Motore mappa non disponibile',false);return}selectedMapObj.on('click',e=>{if(!manualPointMode)return;selectedJob.opLat=e.latlng.lat;selectedJob.opLng=e.latlng.lng;selectedJob.coordSource='manual';manualPointMode=false;el('selectedJobMap')?.classList.remove('manual-mode');if(el('manualPointBtn'))el('manualPointBtn').textContent='🎯 Correggi punto operativo';setLocationStatus('Punto operativo corretto manualmente.','ok');updateOperationalPointLabel();updateSelectedJobMap()})}
 selectedMapObj._sfLayer.clearLayers();
 if(addressCoords)L.circleMarker(addressCoords,{radius:9,color:'#177a3e',fillColor:'#28a85a',fillOpacity:1,weight:3}).addTo(selectedMapObj._sfLayer).bindPopup('<b>Indirizzo intervento</b><br>'+esc(selectedJob.address));
 if(opCoords)L.circleMarker(opCoords,{radius:10,color:'#b35c00',fillColor:'#ef8c24',fillOpacity:1,weight:3}).addTo(selectedMapObj._sfLayer).bindPopup('<b>Punto operativo</b>');
 selectedMapObj.setView(center,addressCoords||opCoords?16:12,{animate:false});requestAnimationFrame(()=>selectedMapObj.invalidateSize(true));setTimeout(()=>selectedMapObj.invalidateSize(true),120);setMapHealth('selectedJobMap',addressCoords||opCoords?'Mappa caricata':'Mappa visibile · indirizzo non localizzato',!!(addressCoords||opCoords));updateOperationalPointLabel();
}
async function updateReportMap(){
 if(!mapVisible('reportRealMap')||typeof L==='undefined')return;let c=activeCoords(selectedJob);if(!c&&selectedJob.address){await geocodeJob(selectedJob,true);c=activeCoords(selectedJob)};const center=c||[45.67,9.96];
 if(!reportMapObj)reportMapObj=makeLeafletMap('reportRealMap',center,c?16:12,[]);if(!reportMapObj)return;
 reportMapObj._sfLayer.clearLayers();if(c)L.marker(c).addTo(reportMapObj._sfLayer);reportMapObj.setView(center,c?16:12,{animate:false});setTimeout(()=>reportMapObj.invalidateSize(true),100);
}

let selectedJob={...demoJobs[0]};
let signatureTarget=null, modalDrawing=false, modalCtx=null;

function selectJob(node){
 document.querySelectorAll('.job-choice').forEach(x=>x.classList.remove('selected')); node.classList.add('selected');
 const source=demoJobs.find(j=>j.id===node.dataset.id);
 selectedJob=source?{...source}:{id:node.dataset.id,client:node.dataset.client,address:node.dataset.address,request:node.dataset.request,lat:null,lng:null,coordSource:'address'};
 el('selectedClient').textContent=selectedJob.client;
 el('selectedAddress').textContent=selectedJob.address;
 el('selectedRequest').textContent=selectedJob.request;
 if(el('jobAddressInput')) el('jobAddressInput').value=selectedJob.address||'';
 if(!Number.isFinite(selectedJob.lat)||!Number.isFinite(selectedJob.lng)){
   geocodeJob(selectedJob,true).then(ok=>{if(ok){updateSelectedJobMap();refreshFieldMap();}});
 }else{
   updateSelectedJobMap();
   if(fieldMapObj){const c=activeCoords(selectedJob);if(c)fieldMapObj.setView(c,15);}
 }
}
function openSelectedMap(){
 const c=activeCoords(selectedJob);
 if(c) window.open('https://www.google.com/maps/dir/?api=1&destination='+c[0]+','+c[1],'_blank');
 else window.open('https://maps.google.com/?q='+encodeURIComponent(selectedJob.address),'_blank');
}
function openSigModal(target){
 signatureTarget=target;
 el('sigTitle').textContent=target==='operatore'?'Firma operatore':'Firma cliente';
 el('sigName').value=target==='operatore'?(el('nomeOperatoreFirma').value||'Luca'):(el('nomeClienteFirma').value||'');
 el('sigModal').classList.add('active');
 setTimeout(initModalCanvas,60);
}
function closeSigModal(){el('sigModal').classList.remove('active')}
function initModalCanvas(){
 const c=el('sigModalCanvas'), ratio=window.devicePixelRatio||1, r=c.getBoundingClientRect();
 c.width=Math.max(1,r.width*ratio); c.height=Math.max(1,r.height*ratio);
 modalCtx=c.getContext('2d'); modalCtx.setTransform(ratio,0,0,ratio,0,0); modalCtx.lineWidth=2.5; modalCtx.lineCap='round'; modalCtx.strokeStyle='#071d35';
 const point=e=>{const rr=c.getBoundingClientRect(),q=e.touches?e.touches[0]:e;return{x:q.clientX-rr.left,y:q.clientY-rr.top}};
 const down=e=>{modalDrawing=true;let q=point(e);modalCtx.beginPath();modalCtx.moveTo(q.x,q.y);e.preventDefault()};
 const move=e=>{if(!modalDrawing)return;let q=point(e);modalCtx.lineTo(q.x,q.y);modalCtx.stroke();e.preventDefault()};
 const up=e=>{modalDrawing=false;e.preventDefault()};
 c.onpointerdown=down;c.onpointermove=move;c.onpointerup=up;c.onpointercancel=up;
}
function clearModalSignature(){const c=el('sigModalCanvas'); if(modalCtx) modalCtx.clearRect(0,0,c.width,c.height)}
function saveModalSignature(){
 const data=el('sigModalCanvas').toDataURL('image/png'), name=(el('sigName').value||'').trim();
 if(signatureTarget==='operatore'){
   el('nomeOperatoreFirma').value=name||'Operatore'; el('firmaOperatore').dataset.signature=data;
   el('opSigStatus').textContent='OK';el('opSigStatus').classList.add('ok');
 }else{
   el('nomeClienteFirma').value=name||'Cliente'; el('firmaCliente').dataset.signature=data;
   el('clSigStatus').textContent='OK';el('clSigStatus').classList.add('ok');
 }
 closeSigModal();
}

function fieldNavigate(name){
 ['Interventi','Agenda','Mappa','Messaggi','Profilo'].forEach(n=>{
   const page=el('field'+n); if(page) page.classList.toggle('active',n===name);
 });
 document.querySelectorAll('#fieldNav button').forEach(b=>b.classList.toggle('active',b.dataset.page===name));
 const resume=el('resumeJob');
 if(resume) resume.classList.toggle('hidden',name==='Interventi'||!jobRunning);
 window.scrollTo({top:0,behavior:'smooth'}); if(name==='Mappa')setTimeout(()=>refreshFieldMap(),80); if(name==='Interventi')setTimeout(()=>updateSelectedJobMap(),80); if(name==='Messaggi')setTimeout(()=>renderOperatorMessages(),30);
}

function openOnly(id){
  ['panelFoto','panelRelazione','panelAttivita','panelAnomalia','firmePanel'].forEach(x=>{
    const p=el(x); if(p) p.classList.toggle('active',x===id);
  });
}
function updateMobileSummary(){
  const photos=['prevPrima','prevDurante','prevDopo','prevAnomalia'].filter(id=>el(id)&&el(id).dataset.img).length;
  if(el('sumFoto')) el('sumFoto').textContent=photos;
  if(el('sumRel')) el('sumRel').textContent=el('relazioneInput').value.trim()?'ok':'da compilare';
  if(el('sumAct')) el('sumAct').textContent=document.querySelectorAll('.chip.active').length;
  const hasAno=(el('anomaliaTipo').value||el('anomaliaTesto').value.trim())?1:0;
  if(el('sumAno')) el('sumAno').textContent=hasAno;
}

function togglePanel(id){
  const p=el(id);
  if(!p) return;
  if(window.matchMedia('(max-width:700px)').matches){
    const was=p.classList.contains('active');
    ['panelFoto','panelRelazione','panelAttivita','panelAnomalia','firmePanel'].forEach(x=>{const q=el(x);if(q)q.classList.remove('active')});
    if(!was){p.classList.add('active');setTimeout(()=>p.scrollIntoView({behavior:'smooth',block:'start'}),30)}
  }else p.classList.toggle('active');
}
function toggleChip(btn){
  btn.classList.toggle('active'); updateMobileSummary();
}
function previewPhoto(input,targetId){
  const file=input.files && input.files[0];
  if(!file) return;
  const reader=new FileReader();
  reader.onload=()=>{
    const box=el(targetId);
    box.dataset.img=reader.result;
    box.innerHTML='<img src="'+reader.result+'" alt="Foto intervento">';
  };
  reader.readAsDataURL(file);
  setTimeout(updateMobileSummary,100);
}
function startSpeech(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){
    alert('Dettatura browser non disponibile. Su iPhone usa il microfono della tastiera per dettare direttamente nel campo.');
    el('relazioneInput').focus();
    return;
  }
  const rec=new SR();
  rec.lang='it-IT';
  rec.interimResults=false;
  rec.continuous=false;
  rec.onresult=e=>{
    const t=e.results[0][0].transcript;
    el('relazioneInput').value+=(el('relazioneInput').value?' ':'')+t;
  };
  rec.start();
}
function generaRelazione(){
  const raw=el('relazioneInput').value.trim();
  if(!raw){
    alert('Descrivi prima l’intervento.');
    return;
  }
  const testo='SITUAZIONE RISCONTRATA\n'+raw+
  '\n\nOPERAZIONI ESEGUITE\n'+buildAttivitaText()+
  '\n\nANOMALIE / NOTE\n'+(el('anomaliaTesto').value.trim()||'Nessuna anomalia segnalata.');
  el('relazioneGenerata').textContent=testo; updateMobileSummary();
}

function renderReportActivities(){
 const list=el('reportActivitiesList'); if(!list) return;
 const selected=[...document.querySelectorAll('.chip.active')].map(x=>x.dataset.act);
 if(!selected.length){list.innerHTML='<li>Nessuna attività selezionata</li>';return;}
 const quantities={
   'Aspirazione reflui':el('qtaMc').value?el('qtaMc').value+' m³':'',
   'Lavaggio alta pressione':el('qtaMetri').value?el('qtaMetri').value+' m':'',
   'Disotturazione tubazione':'',
   'Pulizia pozzetto':'',
   'Videoispezione':'',
   'Pulizia fossa biologica':''
 };
 list.innerHTML=selected.map(a=>'<li><span class="check">✓</span><span>'+a+'</span><b>'+(quantities[a]||'')+'</b></li>').join('');
}

function buildAttivitaText(){
  const acts=[...document.querySelectorAll('.chip.active')].map(x=>x.dataset.act);
  let parts=acts.length?acts:['Nessuna attività selezionata'];
  if(el('qtaMc').value) parts.push('Materiale aspirato: '+el('qtaMc').value+' m³');
  if(el('qtaMetri').value) parts.push('Lavaggio tubazioni: '+el('qtaMetri').value+' m');
  if(el('qtaOre').value) parts.push('Ore mezzo: '+el('qtaOre').value);
  return parts.join(' · ');
}
function setupSignature(id){
  const c=el(id);
  if(!c) return;
  const ctx=c.getContext('2d');
  function resize(){
    const ratio=window.devicePixelRatio||1;
    const r=c.getBoundingClientRect();
    const old = c.toDataURL();
    c.width=Math.max(1,r.width*ratio);
    c.height=Math.max(1,r.height*ratio);
    ctx.setTransform(ratio,0,0,ratio,0,0);
    ctx.lineWidth=2;
    ctx.lineCap='round';
    ctx.strokeStyle='#0b2948';
  }
  resize();
  let drawing=false;
  const pos=e=>{
    const r=c.getBoundingClientRect();
    const p=e.touches?e.touches[0]:e;
    return {x:p.clientX-r.left,y:p.clientY-r.top};
  };
  const down=e=>{drawing=true;const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()};
  const move=e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()};
  const up=e=>{drawing=false;e.preventDefault()};
  c.addEventListener('pointerdown',down); c.addEventListener('pointermove',move); c.addEventListener('pointerup',up); c.addEventListener('pointerleave',up);
  c.addEventListener('touchstart',down,{passive:false}); c.addEventListener('touchmove',move,{passive:false}); c.addEventListener('touchend',up,{passive:false});
}
function clearSignature(id){
  const c=el(id),ctx=c.getContext('2d');
  ctx.clearRect(0,0,c.width,c.height);
}
function copyPreviewToReport(srcId,dstId){
  const src=el(srcId),dst=el(dstId);
  const img=src && src.dataset.img;
  dst.innerHTML=img?'<img src="'+img+'" alt="Foto intervento">':'Nessuna foto';
}
function prepareAndShowReport(){
  if(!jobRunning){alert('Nessun intervento attivo.');return;}
  if(!el('firmaOperatore').dataset.signature || !el('firmaCliente').dataset.signature){
    alert('Per chiudere l’intervento servono entrambe le firme: operatore e cliente.');
    return;
  }
  clearInterval(timerInt);
  jobRunning=false; sessionStorage.removeItem('sf_job_running'); sessionStorage.removeItem('sf_selected_job');
  el('job').classList.add('hidden'); el('jobPicker').style.display='grid'; el('startBtn').disabled=false; el('startBtn').textContent='Inizia intervento';
  el('selectedJobCard').insertAdjacentHTML('beforebegin','<div class="finished-card">✓ Intervento '+selectedJob.id+' terminato e rapportino generato.</div>');
  const now=new Date();
  const closedLabel=now.toLocaleDateString('it-IT')+' '+now.toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'});
  const completedRecord={...selectedJob,status:'Terminato',closedAt:closedLabel,reportNo:String(selectedJob.id||'').replace('INT-','')};
  completedJobs=completedJobs.filter(x=>x.id!==completedRecord.id);
  completedJobs.unshift(completedRecord);
  renderCompletedJobs();
  populateReportFromSelected();

  const rel=el('relazioneGenerata').textContent.trim();
  el('reportRelazione').textContent=(rel && !rel.startsWith('La relazione generata'))?rel:(el('relazioneInput').value.trim()||'Relazione non compilata.');
  
  const tipo=el('anomaliaTipo').value.trim();
  const anom=el('anomaliaTesto').value.trim();
  if(el('reportAnomaliaTop')) el('reportAnomaliaTop').textContent=(tipo||anom)?((tipo?tipo+': ':'')+(anom||'Anomalia segnalata.')):'Nessuna anomalia segnalata.';
  copyPreviewToReport('prevPrima','reportFotoPrima');
  copyPreviewToReport('prevDurante','reportFotoDurante');
  copyPreviewToReport('prevDopo','reportFotoDopo'); renderReportActivities();
  const opName=(el('nomeOperatoreFirma').value||'Operatore').trim();
  const clName=(el('nomeClienteFirma').value||'Cliente').trim();
  el('reportOperatoreNome').textContent=opName;
  el('reportClienteNome').textContent=clName;
  try{
    const data=el('firmaOperatore').dataset.signature || el('firmaOperatore').toDataURL('image/png');
    el('reportFirmaOperatore').innerHTML='<img src="'+data+'" style="max-width:100%;height:50px;object-fit:contain">';
  }catch(e){}
  try{
    const data2=el('firmaCliente').dataset.signature || el('firmaCliente').toDataURL('image/png');
    el('reportFirmaCliente').innerHTML='<img src="'+data2+'" style="max-width:100%;height:50px;object-fit:contain">';
  }catch(e){}
  showReport();
}

function startJob(){
  jobRunning=true; sessionStorage.setItem('sf_job_running','1');
  sessionStorage.setItem('sf_selected_job',JSON.stringify(selectedJob));
  el('job').classList.remove('hidden');
  el('jobPicker').style.display='none';
  el('startBtn').disabled=true; el('startBtn').textContent='Intervento in corso';
  secs=0;
  clearInterval(timerInt);
  timerInt=setInterval(()=>{
    secs++;
    el('timer').textContent=String(Math.floor(secs/60)).padStart(2,'0')+':'+String(secs%60).padStart(2,'0'); if(el('resumeTimer')) el('resumeTimer').textContent=el('timer').textContent;
  },1000);
}

function showReport(){
  clearInterval(timerInt);
  prevView = !el('operator').classList.contains('hidden') ? 'operator' : 'office';
  el('office').classList.add('hidden');
  el('operator').classList.add('hidden');
  el('reportView').classList.remove('hidden'); setTimeout(()=>updateReportMap(),120);
}

function closeReport(){
  el('reportView').classList.add('hidden');
  el(prevView).classList.remove('hidden');
  if(prevView==='operator'){
    renderCompletedJobs();
    fieldNavigate('Interventi');
  }
  setTimeout(invalidateVisibleMaps,120);
}


function preparePrint(){updateReportMap();setTimeout(()=>{if(reportMapObj)reportMapObj.invalidateSize(true);window.print()},450);}

function shareMail(){
  location.href='mailto:?subject=Rapportino Spurgo Flow 2026-00051&body=In allegato/da condividere il rapportino dell’intervento n. 2026-00051.';
}
function shareWA(){
  window.open('https://wa.me/?text='+encodeURIComponent('Spurgo Flow — Rapportino intervento n. 2026-00051. Il PDF può essere condiviso dal dispositivo.'),'_blank');
}
async function shareNative(){
  if(navigator.share){
    try{
      await navigator.share({title:'Rapportino Spurgo Flow',text:'Rapportino intervento n. 2026-00051'});
    }catch(e){}
  }else{
    window.print();
  }
}


document.addEventListener('input',e=>{
  if(['relazioneInput','anomaliaTipo','anomaliaTesto'].includes(e.target.id)) updateMobileSummary();
});
function markSignatureStatus(canvasId,statusId){
 const c=el(canvasId); if(!c) return;
 const mark=()=>{const s=el(statusId);if(s){s.textContent='OK';s.classList.add('ok')}};
 c.addEventListener('pointerup',mark);c.addEventListener('touchend',mark,{passive:true});
}
setTimeout(()=>{markSignatureStatus('firmaOperatore','opSigStatus');markSignatureStatus('firmaCliente','clSigStatus');updateMobileSummary()},500);

window.addEventListener('load',()=>{if(el('agendaDate'))el('agendaDate').value=TODAY_2026;renderCompletedJobs();renderOfficePeople();renderAllOfficeV6();updateMessageBadges();});

window.addEventListener('orientationchange',()=>setTimeout(invalidateVisibleMaps,180));
window.addEventListener('resize',()=>setTimeout(invalidateVisibleMaps,180));
if('serviceWorker' in navigator){
  navigator.serviceWorker.register('./sw.js').catch(()=>{});
}
