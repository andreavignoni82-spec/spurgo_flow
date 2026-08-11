/* SPURGO FLOW - Beta v0.2
 * Demo PWA client-side. Nessun dato lascia il browser salvo uso esplicito endpoint AI.
 * Le password sono hashate con SHA-256 ma, essendo una demo statica, non equivalgono a una vera autenticazione server-side.
 */

const APP_VERSION = '0.2';
const TODAY_LABEL = new Intl.DateTimeFormat('it-IT', {weekday:'long', day:'2-digit', month:'long', year:'numeric'}).format(new Date());
const DBKEY = 'sf_v02_db';
const SESSIONKEY = 'sf_v02_session';
const SETTINGSKEY = 'sf_v02_settings';

const seedJobs = [
  {id:1001, client:'Condominio Belvedere', address:'Via Roma 24, Sarnico', phone:'+39 333 1234567', email:'amministrazione@demo.it', issue:'Intasamento scarico garage', time:'10:30', status:'urgent', priority:'Emergenza', operatorId:'op_marco', vehicle:'Autobotte 01', notes:'Chiamare amministratore 10 minuti prima dell’arrivo.', history:['13/03/2026 – Pulizia pozzetto garage','22/09/2025 – Videoispezione condotta'], permanent:'Pozzetto principale dietro il garage. Accesso autobotte dal cancello secondario.', photos:[], activities:[], anomalies:[], report:'', transcript:'', gps:null, signer:'', signature:'', startedAt:null, endedAt:null},
  {id:1002, client:'Ristorante Lago', address:'Lungolago Garibaldi 8, Sarnico', phone:'+39 333 4445566', email:'', issue:'Pulizia degrassatore', time:'08:00', status:'done', priority:'Normale', operatorId:'op_luca', vehicle:'Autobotte 02', notes:'Accesso da retro cucina.', history:['11/01/2026 – Pulizia degrassatore'], permanent:'Ingresso stretto, preferibile mezzo compatto.', photos:[], activities:['Pulizia degrassatore'], anomalies:[], report:'Pulizia ordinaria del degrassatore eseguita con aspirazione e lavaggio finale.', transcript:'', gps:null, signer:'Mario Bianchi', signature:'', startedAt:null, endedAt:null},
  {id:1003, client:'Residence Sole', address:'Via Predore 15, Sarnico', phone:'+39 333 7711223', email:'', issue:'Lavaggio tubazione', time:'14:00', status:'planned', priority:'Normale', operatorId:'op_marco', vehicle:'Autobotte 01', notes:'Referente presente dalle 13:45.', history:[], permanent:'Necessari almeno 30 m di tubo.', photos:[], activities:[], anomalies:[], report:'', transcript:'', gps:null, signer:'', signature:'', startedAt:null, endedAt:null},
  {id:1004, client:'Bianchi Carlo', address:'Via Vittorio Veneto 4, Paratico', phone:'+39 333 9080706', email:'', issue:'Svuotamento fossa biologica', time:'11:15', status:'unassigned', priority:'Urgente', operatorId:'', vehicle:'', notes:'Cliente disponibile fino alle 13:00.', history:['08/08/2025 – Svuotamento fossa'], permanent:'', photos:[], activities:[], anomalies:[], report:'', transcript:'', gps:null, signer:'', signature:'', startedAt:null, endedAt:null}
];

const defaultUsers = [
  {id:'office_admin', username:'ufficio', name:'Ufficio', role:'office', enabled:true, passwordHash:''},
  {id:'op_marco', username:'marco', name:'Marco', role:'operator', enabled:true, passwordHash:''},
  {id:'op_luca', username:'luca', name:'Luca', role:'operator', enabled:true, passwordHash:''}
];

const state = { db:null, session:null, currentJobId:null, photoCategory:'DURANTE', timerHandle:null };

function el(html){ const t=document.createElement('template'); t.innerHTML=html.trim(); return t.content.firstChild; }
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }
function statusLabel(s){ return ({urgent:'Urgente',progress:'In corso',planned:'Programmato',done:'Completato',unassigned:'Da assegnare'})[s]||s; }
function statusClass(s){ return `status-${s}`; }
function nowIso(){ return new Date().toISOString(); }
function uid(prefix='id'){ return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2,7)}`; }
function operatorName(id){ return state.db.users.find(u=>u.id===id)?.name || 'Da assegnare'; }
function currentUser(){ return state.db?.users.find(u=>u.id===state.session?.userId) || null; }
function operatorUsers(){ return state.db.users.filter(u=>u.role==='operator' && u.enabled); }
function saveDb(){ localStorage.setItem(DBKEY, JSON.stringify(state.db)); }
function saveSession(){ if(state.session) sessionStorage.setItem(SESSIONKEY, JSON.stringify(state.session)); else sessionStorage.removeItem(SESSIONKEY); }
function getSettings(){ return JSON.parse(localStorage.getItem(SETTINGSKEY) || '{"aiEndpoint":"","aiToken":"","companyName":"Demo Spurghi Srl","companyPhone":"","companyEmail":""}'); }
function saveSettings(x){ localStorage.setItem(SETTINGSKEY, JSON.stringify(x)); }

async function sha256(text){
  const data = new TextEncoder().encode(text);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(hash)].map(b=>b.toString(16).padStart(2,'0')).join('');
}

async function init(){
  let db = JSON.parse(localStorage.getItem(DBKEY) || 'null');
  if(!db){
    const users = structuredClone(defaultUsers);
    users[0].passwordHash = await sha256('ufficio123');
    users[1].passwordHash = await sha256('marco123');
    users[2].passwordHash = await sha256('luca123');
    db = {users, jobs:structuredClone(seedJobs), createdAt:nowIso()};
    localStorage.setItem(DBKEY, JSON.stringify(db));
  }
  state.db = db;
  state.session = JSON.parse(sessionStorage.getItem(SESSIONKEY) || 'null');
  if(state.session && !currentUser()) { state.session=null; saveSession(); }
  render();
  if('serviceWorker' in navigator){ navigator.serviceWorker.register('./sw.js').catch(()=>{}); }
}

function render(){
  clearInterval(state.timerHandle);
  const app=document.getElementById('app'); app.innerHTML='';
  if(!state.session) return renderLogin(app);
  const u=currentUser(); if(!u || !u.enabled){ logout(); return; }
  u.role==='office' ? renderOffice(app) : renderOperator(app);
}

function renderLogin(app){
  app.append(el(`<div class="login-wrap"><div class="login-card">
    <div class="logo-mark">SF</div><div class="pill">BETA v${APP_VERSION}</div>
    <h1>Spurgo <span>Flow</span></h1><p class="meta">Gestione digitale degli interventi esterni.</p>
    <form id="loginForm" class="login-form">
      <div class="field"><label>Utente</label><input id="loginUser" autocomplete="username" required placeholder="es. marco"></div>
      <div class="field"><label>Password</label><input id="loginPass" type="password" autocomplete="current-password" required></div>
      <div id="loginError" class="error-text"></div>
      <button class="btn btn-primary btn-block btn-large">ACCEDI</button>
    </form>
    <details class="demo-credentials"><summary>Credenziali demo</summary><div class="meta">Ufficio: <b>ufficio / ufficio123</b><br>Marco: <b>marco / marco123</b><br>Luca: <b>luca / luca123</b></div></details>
    <div class="security-note">🔒 Ogni operatore visualizza esclusivamente i propri interventi.</div>
  </div></div>`));
  document.getElementById('loginForm').onsubmit=async e=>{
    e.preventDefault();
    const username=document.getElementById('loginUser').value.trim().toLowerCase();
    const hash=await sha256(document.getElementById('loginPass').value);
    const u=state.db.users.find(x=>x.username.toLowerCase()===username && x.passwordHash===hash && x.enabled);
    if(!u){ document.getElementById('loginError').textContent='Utente o password non corretti.'; return; }
    state.session={userId:u.id, loginAt:nowIso()}; saveSession(); render();
  };
}

function logout(){ state.session=null; state.currentJobId=null; saveSession(); render(); }
function topbar(title='SPURGO FLOW'){
  const u=currentUser(); return el(`<div class="topbar"><div><div class="brand">${title.replace('FLOW','<span>FLOW</span>')}</div><div class="tiny-user">${esc(u?.name||'')}</div></div><div class="top-actions"><button class="btn btn-secondary" id="logoutBtn">Esci</button></div></div>`);
}
function wireTopbar(){ document.getElementById('logoutBtn')?.addEventListener('click', logout); }

function renderOffice(app){
  const jobs=state.db.jobs;
  app.append(topbar());
  app.append(el(`<main class="container">
    <div class="hero"><div><div class="eyebrow">CENTRALE OPERATIVA</div><h1>Dashboard ufficio</h1><p>${esc(TODAY_LABEL)} · ${esc(getSettings().companyName)}</p></div><div class="hero-actions"><button class="btn btn-secondary" id="manageUsers">👥 Operatori</button><button class="btn btn-secondary" id="settingsBtn">⚙️ Impostazioni</button><button class="btn btn-primary" id="newJob">+ Nuovo intervento</button></div></div>
    <div class="grid kpis" id="kpis"></div>
    <div class="grid two" style="margin-top:18px"><section class="card"><div class="section-title"><h2>Interventi</h2><span class="pill">${jobs.length} totali</span></div><div id="jobList"></div></section><section class="card"><div class="section-title"><h2>Agenda operatori</h2></div><div id="agenda"></div></section></div>
    <div class="section-title"><h2>Clienti e memoria tecnica</h2></div><div class="grid three" id="clients"></div>
  </main>`)); wireTopbar();
  const counts={unassigned:0,planned:0,progress:0,done:0,urgent:0}; jobs.forEach(j=>counts[j.status]=(counts[j.status]||0)+1);
  document.getElementById('kpis').innerHTML=[['Interventi',jobs.length],['Da assegnare',counts.unassigned],['Programm./Urgenti',counts.planned+counts.urgent],['In corso',counts.progress],['Completati',counts.done]].map(x=>`<div class="card kpi"><strong>${x[1]}</strong><span>${x[0]}</span></div>`).join('');
  document.getElementById('jobList').innerHTML=jobs.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')).map(j=>`<div class="job"><div class="status-bar ${statusClass(j.status)}"></div><div><div class="pill">${statusLabel(j.status)}</div><h3>${esc(j.client)}</h3><div class="meta">${esc(j.time)} · ${esc(j.address)}<br>${esc(j.issue)} · ${esc(operatorName(j.operatorId))}</div></div><button class="btn btn-secondary" data-open-job="${j.id}">Apri</button></div>`).join('');
  document.querySelectorAll('[data-open-job]').forEach(b=>b.onclick=()=>openOfficeJob(Number(b.dataset.openJob)));
  document.getElementById('agenda').innerHTML=operatorUsers().map(o=>`<div class="history-item"><strong>${esc(o.name)}</strong><div class="meta">${jobs.filter(j=>j.operatorId===o.id).sort((a,b)=>a.time.localeCompare(b.time)).map(j=>`${esc(j.time)} – ${esc(j.client)} <span class="mini-status">${statusLabel(j.status)}</span>`).join('<br>')||'Nessun intervento'}</div></div>`).join('') || '<div class="empty">Nessun operatore attivo</div>';
  const grouped=[...new Map(jobs.map(j=>[j.client,j])).values()];
  document.getElementById('clients').innerHTML=grouped.map(j=>`<div class="card"><strong>${esc(j.client)}</strong><div class="meta">${esc(j.address)}</div><p class="meta">${esc(j.permanent||'Nessuna informazione permanente.')}</p><button class="btn btn-secondary" data-client="${encodeURIComponent(j.client)}">Storico</button></div>`).join('');
  document.querySelectorAll('[data-client]').forEach(b=>b.onclick=()=>openClient(decodeURIComponent(b.dataset.client)));
  document.getElementById('newJob').onclick=renderNewJob;
  document.getElementById('manageUsers').onclick=renderUsers;
  document.getElementById('settingsBtn').onclick=renderSettings;
}

function openOfficeJob(id){
  const j=state.db.jobs.find(x=>x.id===id); if(!j) return render();
  const app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  const opts=operatorUsers().map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('');
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backDash">← Dashboard</button>
    <div class="section-title"><div><div class="eyebrow">INTERVENTO #${j.id}</div><h2>${esc(j.client)}</h2></div><span class="pill">${statusLabel(j.status)}</span></div>
    <div class="grid two"><section class="card"><h3>${esc(j.issue)}</h3><div class="meta">${esc(j.address)}<br>${esc(j.time)} · ${esc(j.priority)}<br>Operatore: ${esc(operatorName(j.operatorId))}<br>Mezzo: ${esc(j.vehicle||'—')}</div>
      <div class="section-title"><h2>Note ufficio</h2></div><p>${esc(j.notes||'—')}</p><div class="section-title"><h2>Memoria tecnica</h2></div><p>${esc(j.permanent||'—')}</p>
      ${j.gps?`<div class="note">📍 GPS intervento: ${j.gps.lat.toFixed(5)}, ${j.gps.lng.toFixed(5)} <a target="_blank" href="https://www.openstreetmap.org/?mlat=${j.gps.lat}&mlon=${j.gps.lng}#map=18/${j.gps.lat}/${j.gps.lng}">Apri mappa</a></div>`:''}
    </section><section class="card"><h3>Gestione</h3><div class="field"><label>Operatore</label><select id="assignOp"><option value="">Da assegnare</option>${opts}</select></div><div class="field"><label>Mezzo</label><select id="assignVehicle"><option value="">—</option><option>Autobotte 01</option><option>Autobotte 02</option><option>Mezzo compatto</option></select></div><button class="btn btn-primary btn-block" id="saveAssign">Salva assegnazione</button>
      <div class="section-title"><h2>Rapportino</h2></div><button class="btn btn-secondary btn-block" id="pdfBtn" ${j.status!=='done'?'disabled':''}>📄 Scarica PDF</button>
      <div class="section-title"><h2>Foto</h2></div><div class="photo-grid">${(j.photos||[]).map(p=>`<img src="${p.data}" alt="${esc(p.category)}" title="${esc(p.category)}">`).join('') || '<div class="empty">Nessuna foto</div>'}</div>
      <div class="section-title"><h2>Storico</h2></div>${j.history?.length?j.history.map(h=>`<div class="history-item">${esc(h)}</div>`).join(''):'<div class="empty">Nessun precedente</div>'}
    </section></div></main>`)); wireTopbar();
  document.getElementById('backDash').onclick=render;
  document.getElementById('assignOp').value=j.operatorId||''; document.getElementById('assignVehicle').value=j.vehicle||'';
  document.getElementById('saveAssign').onclick=()=>{ j.operatorId=document.getElementById('assignOp').value; j.vehicle=document.getElementById('assignVehicle').value; if(j.status!=='done'&&j.status!=='progress') j.status=j.operatorId?(j.priority==='Emergenza'?'urgent':'planned'):'unassigned'; saveDb(); openOfficeJob(j.id); };
  document.getElementById('pdfBtn').onclick=()=>generatePdf(j);
}

function openClient(name){
  const jobs=state.db.jobs.filter(j=>j.client===name).sort((a,b)=>b.id-a.id), j=jobs[0];
  const app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backDash">← Dashboard</button><div class="hero"><div><div class="eyebrow">SCHEDA CLIENTE</div><h1>${esc(name)}</h1><p>${esc(j?.address||'')}</p></div></div>
    <div class="grid two"><section class="card"><h2>Memoria tecnica</h2><textarea id="permEdit" class="big-textarea">${esc(j?.permanent||'')}</textarea><button class="btn btn-primary" id="savePerm">Salva memoria</button></section><section class="card"><h2>Storico interventi</h2>${jobs.map(x=>`<div class="history-item"><strong>#${x.id} · ${esc(x.issue)}</strong><div class="meta">${esc(x.time)} · ${statusLabel(x.status)} · ${esc(operatorName(x.operatorId))}</div></div>`).join('')}</section></div>
  </main>`)); wireTopbar(); document.getElementById('backDash').onclick=render;
  document.getElementById('savePerm').onclick=()=>{ const v=document.getElementById('permEdit').value.trim(); state.db.jobs.filter(x=>x.client===name).forEach(x=>x.permanent=v); saveDb(); openClient(name); };
}

function renderNewJob(){
  const app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  const opts=operatorUsers().map(o=>`<option value="${o.id}">${esc(o.name)}</option>`).join('');
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backDash">← Dashboard</button><div class="section-title"><h2>Nuovo intervento</h2></div><form class="card form-grid" id="newJobForm">
    <div class="field"><label>Cliente</label><input id="client" required></div><div class="field"><label>Telefono</label><input id="phone"></div><div class="field"><label>Email</label><input id="email" type="email"></div><div class="field"><label>Ora</label><input id="time" type="time" value="09:00"></div><div class="field span-2"><label>Indirizzo</label><input id="address" required></div><div class="field"><label>Tipologia</label><select id="issue"><option>Spurgo</option><option>Disotturazione</option><option>Pulizia fossa biologica</option><option>Lavaggio tubazioni</option><option>Videoispezione</option><option>Svuotamento</option><option>Sopralluogo</option><option>Altro</option></select></div><div class="field"><label>Priorità</label><select id="priority"><option>Normale</option><option>Urgente</option><option>Emergenza</option></select></div><div class="field"><label>Operatore</label><select id="operator"><option value="">Da assegnare</option>${opts}</select></div><div class="field"><label>Mezzo</label><select id="vehicle"><option value="">—</option><option>Autobotte 01</option><option>Autobotte 02</option><option>Mezzo compatto</option></select></div><div class="field span-2"><label>Descrizione / note</label><textarea id="notes"></textarea></div><div class="span-2"><button class="btn btn-primary btn-block btn-large">Salva e assegna</button></div>
  </form></main>`)); wireTopbar(); document.getElementById('backDash').onclick=render;
  document.getElementById('newJobForm').onsubmit=e=>{e.preventDefault(); const op=document.getElementById('operator').value, p=document.getElementById('priority').value; state.db.jobs.push({id:Date.now(),client:document.getElementById('client').value.trim(),address:document.getElementById('address').value.trim(),phone:document.getElementById('phone').value.trim(),email:document.getElementById('email').value.trim(),issue:document.getElementById('issue').value,time:document.getElementById('time').value,status:op?(p==='Emergenza'?'urgent':'planned'):'unassigned',priority:p,operatorId:op,vehicle:document.getElementById('vehicle').value,notes:document.getElementById('notes').value.trim(),history:[],permanent:'',photos:[],activities:[],anomalies:[],report:'',transcript:'',gps:null,signer:'',signature:'',startedAt:null,endedAt:null});saveDb();render();};
}

function renderUsers(){
  const app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backDash">← Dashboard</button><div class="hero"><div><div class="eyebrow">ACCESSI</div><h1>Operatori</h1><p>Ogni operatore ha credenziali personali e vede solo i propri interventi.</p></div><button class="btn btn-primary" id="addUser">+ Nuovo operatore</button></div><div class="card" id="userList"></div></main>`)); wireTopbar(); document.getElementById('backDash').onclick=render;
  document.getElementById('userList').innerHTML=operatorUsers().map(u=>`<div class="user-row"><div class="avatar">${esc(u.name.charAt(0))}</div><div><strong>${esc(u.name)}</strong><div class="meta">utente: ${esc(u.username)} · ${state.db.jobs.filter(j=>j.operatorId===u.id).length} interventi</div></div><button class="btn btn-secondary" data-reset="${u.id}">Cambia password</button></div>`).join('');
  document.querySelectorAll('[data-reset]').forEach(b=>b.onclick=async()=>{ const p=prompt('Nuova password (minimo 6 caratteri):'); if(!p||p.length<6) return alert('Password non modificata. Minimo 6 caratteri.'); const u=state.db.users.find(x=>x.id===b.dataset.reset); u.passwordHash=await sha256(p); saveDb(); alert(`Password di ${u.name} aggiornata.`); });
  document.getElementById('addUser').onclick=()=>renderAddUser();
}

function renderAddUser(){
  const app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backUsers">← Operatori</button><div class="section-title"><h2>Nuovo operatore</h2></div><form class="card form-grid" id="userForm"><div class="field"><label>Nome</label><input id="uName" required></div><div class="field"><label>Username</label><input id="uUser" required></div><div class="field span-2"><label>Password iniziale</label><input id="uPass" type="password" minlength="6" required></div><div class="span-2"><button class="btn btn-primary btn-block">Crea accesso</button></div></form></main>`)); wireTopbar(); document.getElementById('backUsers').onclick=renderUsers;
  document.getElementById('userForm').onsubmit=async e=>{e.preventDefault(); const username=document.getElementById('uUser').value.trim().toLowerCase(); if(state.db.users.some(x=>x.username.toLowerCase()===username)) return alert('Username già esistente.'); state.db.users.push({id:uid('op'),username,name:document.getElementById('uName').value.trim(),role:'operator',enabled:true,passwordHash:await sha256(document.getElementById('uPass').value)}); saveDb(); renderUsers();};
}

function renderSettings(){
  const s=getSettings(), app=document.getElementById('app'); app.innerHTML=''; app.append(topbar());
  app.append(el(`<main class="container"><button class="btn btn-secondary" id="backDash">← Dashboard</button><div class="section-title"><h2>Impostazioni Beta</h2></div><form class="card form-grid" id="settingsForm"><div class="field"><label>Nome azienda</label><input id="companyName" value="${esc(s.companyName)}"></div><div class="field"><label>Telefono</label><input id="companyPhone" value="${esc(s.companyPhone)}"></div><div class="field span-2"><label>Email</label><input id="companyEmail" value="${esc(s.companyEmail)}"></div><div class="span-2"><hr><h3>AI relazione tecnica</h3><p class="meta">Per sicurezza GitHub Pages non deve contenere chiavi API segrete. Puoi indicare un tuo endpoint proxy/Worker; senza endpoint viene usato il generatore locale della Beta.</p></div><div class="field span-2"><label>Endpoint AI opzionale</label><input id="aiEndpoint" value="${esc(s.aiEndpoint)}" placeholder="https://.../generate-report"></div><div class="field span-2"><label>Token endpoint opzionale</label><input id="aiToken" type="password" value="${esc(s.aiToken)}"></div><div class="span-2"><button class="btn btn-primary btn-block">Salva impostazioni</button></div></form></main>`)); wireTopbar(); document.getElementById('backDash').onclick=render;
  document.getElementById('settingsForm').onsubmit=e=>{e.preventDefault(); saveSettings({companyName:document.getElementById('companyName').value.trim()||'Demo Spurghi Srl',companyPhone:document.getElementById('companyPhone').value.trim(),companyEmail:document.getElementById('companyEmail').value.trim(),aiEndpoint:document.getElementById('aiEndpoint').value.trim(),aiToken:document.getElementById('aiToken').value.trim()}); alert('Impostazioni salvate.'); render();};
}

function renderOperator(app){
  const u=currentUser(); const jobs=state.db.jobs.filter(j=>j.operatorId===u.id);
  app.append(el(`<div class="mobile-shell"><div class="mobile-header"><div class="operator-head"><div><div class="pill pill-dark">OPERATORE</div><h1>Ciao ${esc(u.name)}</h1><div>${jobs.filter(j=>j.status!=='done').length} interventi da gestire</div></div><button class="btn btn-secondary" id="logoutBtn">Esci</button></div></div><div class="mobile-content"><div class="section-title"><h2>I tuoi interventi</h2><span class="pill">Solo area personale</span></div><div id="operatorJobs"></div></div><div class="bottom-nav"><button class="btn btn-secondary" id="todayBtn">Oggi</button><button class="btn btn-secondary" id="surveyBtn">Sopralluogo</button><button class="btn btn-secondary" id="historyBtn">Storico</button></div></div>`));
  document.getElementById('logoutBtn').onclick=logout;
  document.getElementById('operatorJobs').innerHTML=jobs.length?jobs.sort((a,b)=>a.time.localeCompare(b.time)).map(j=>`<div class="mobile-job ${j.status==='done'?'job-done':''}"><div class="job-top"><span class="pill">${statusLabel(j.status)}</span><strong>${esc(j.time)}</strong></div><h3>${esc(j.client)}</h3><div class="meta">${esc(j.address)}<br>${esc(j.issue)}</div><button class="btn ${j.status==='done'?'btn-secondary':'btn-primary'} btn-block" style="margin-top:12px" data-opjob="${j.id}">${j.status==='done'?'Visualizza rapportino':'Apri intervento'}</button></div>`).join(''):'<div class="empty">Nessun intervento assegnato</div>';
  document.querySelectorAll('[data-opjob]').forEach(b=>b.onclick=()=>openOperatorJob(Number(b.dataset.opjob)));
  document.getElementById('todayBtn').onclick=render;
  document.getElementById('surveyBtn').onclick=()=>renderSurvey();
  document.getElementById('historyBtn').onclick=()=>renderOperatorHistory();
}

function getAuthorizedJob(id){
  const u=currentUser(); const j=state.db.jobs.find(x=>x.id===id); if(!j) return null;
  if(u.role==='office') return j;
  return j.operatorId===u.id ? j : null;
}

function openOperatorJob(id){
  const j=getAuthorizedJob(id); if(!j) return alert('Intervento non disponibile nella tua area.');
  if(j.status==='done') return renderDoneJob(j);
  state.currentJobId=id; const app=document.getElementById('app'); app.innerHTML='';
  app.append(el(`<div class="mobile-shell"><div class="mobile-header"><button class="btn btn-secondary" id="backToday">← Oggi</button><h1>${esc(j.client)}</h1><div>${esc(j.address)}</div></div><div class="mobile-content"><div class="mobile-actions"><a class="btn btn-secondary link-btn" target="_blank" href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(j.address)}">🧭 Naviga</a><a class="btn btn-secondary link-btn" href="tel:${encodeURIComponent(j.phone)}">📞 Chiama</a></div><div class="card" style="margin-top:14px"><div class="section-title"><h2>Richiesta cliente</h2></div><p><strong>${esc(j.issue)}</strong></p><p class="meta">${esc(j.notes||'Nessuna nota ufficio.')}</p><div class="section-title"><h2>Memoria tecnica</h2></div><div class="note">${esc(j.permanent||'Nessuna informazione permanente disponibile.')}</div><div class="section-title"><h2>Storico</h2></div>${j.history?.length?j.history.map(h=>`<div class="history-item">${esc(h)}</div>`).join(''):'<div class="empty">Nessun precedente</div>'}</div><button class="btn btn-success btn-block btn-large" style="margin-top:14px" id="startJob">${j.status==='progress'?'RIPRENDI INTERVENTO':'INIZIA INTERVENTO'}</button></div></div>`));
  document.getElementById('backToday').onclick=render;
  document.getElementById('startJob').onclick=()=>startJob(j);
}

function startJob(j){
  if(!j.startedAt) j.startedAt=nowIso(); j.status='progress'; saveDb(); captureGps(j, false); renderWorking(j);
}
function elapsedSec(j){ return j.startedAt?Math.max(0,Math.floor((Date.now()-new Date(j.startedAt).getTime())/1000)):0; }
function formatTime(sec){ const h=Math.floor(sec/3600).toString().padStart(2,'0'), m=Math.floor((sec%3600)/60).toString().padStart(2,'0'), s=(sec%60).toString().padStart(2,'0'); return `${h}:${m}:${s}`; }

function renderWorking(j){
  if(!getAuthorizedJob(j.id)) return render();
  const app=document.getElementById('app'); app.innerHTML='';
  app.append(el(`<div class="mobile-shell"><div class="mobile-header work-header"><div class="pill pill-work">INTERVENTO IN CORSO</div><h1>${esc(j.client)}</h1><div class="timer" id="timer">${formatTime(elapsedSec(j))}</div><div class="gps-mini" id="gpsMini">${j.gps?'📍 Posizione acquisita':'📍 Acquisizione posizione…'}</div></div><div class="mobile-content"><div class="mobile-actions"><button class="action-tile" id="photoBtn">📷<br>FOTO <small>${j.photos?.length||0}</small></button><button class="action-tile" id="voiceBtn">🎙️<br>RELAZIONE</button><button class="action-tile" id="activityBtn">🛠️<br>ATTIVITÀ <small>${j.activities?.length||0}</small></button><button class="action-tile" id="anomalyBtn">⚠️<br>ANOMALIA <small>${j.anomalies?.length||0}</small></button></div>
    <div class="card" style="margin-top:14px"><div class="section-title"><h2>Relazione operatore</h2></div><textarea id="transcript" class="big-textarea" placeholder="Detta o scrivi cosa è stato fatto...">${esc(j.transcript||'')}</textarea><button class="btn btn-primary btn-block" id="aiReport">✨ Genera relazione professionale</button><div id="aiStatus" class="meta center"></div><div id="reportBox">${j.report?`<div class="note report-note">${esc(j.report).replace(/\n/g,'<br>')}</div>`:''}</div></div>
    <div class="card" style="margin-top:14px"><div class="section-title"><h2>Documentazione</h2><button class="btn btn-secondary" id="gpsBtn">📍 GPS</button></div><div class="photo-grid">${(j.photos||[]).map(p=>`<div class="photo-card"><img src="${p.data}" alt="${esc(p.category)}"><span>${esc(p.category)}</span></div>`).join('') || '<div class="empty">Scatta la prima foto</div>'}</div></div>
    <button class="btn btn-danger btn-block btn-large" style="margin-top:14px" id="endJob">TERMINA INTERVENTO</button></div></div>`));
  const timer=document.getElementById('timer'); state.timerHandle=setInterval(()=>{ if(document.body.contains(timer)) timer.textContent=formatTime(elapsedSec(j)); },1000);
  document.getElementById('transcript').oninput=e=>{ j.transcript=e.target.value; saveDb(); };
  document.getElementById('photoBtn').onclick=()=>openPhotoPicker(j);
  document.getElementById('activityBtn').onclick=()=>openActivities(j);
  document.getElementById('anomalyBtn').onclick=()=>addAnomaly(j);
  document.getElementById('voiceBtn').onclick=()=>startVoice(j);
  document.getElementById('aiReport').onclick=()=>generateAiReport(j);
  document.getElementById('gpsBtn').onclick=()=>captureGps(j,true);
  document.getElementById('endJob').onclick=()=>closeJob(j);
}

function openPhotoPicker(j){
  const cat=prompt('Categoria foto: PRIMA, DURANTE, DOPO, ANOMALIA', state.photoCategory||'DURANTE'); if(!cat) return;
  state.photoCategory=cat.toUpperCase(); const input=document.getElementById('cameraInput'); input.value='';
  input.onchange=async()=>{ if(!input.files?.[0]) return; const data=await compressImage(input.files[0]); j.photos=j.photos||[]; j.photos.push({id:uid('photo'),category:state.photoCategory,data,at:nowIso()}); saveDb(); renderWorking(j); };
  input.click();
}
async function compressImage(file){
  const img=await new Promise((res,rej)=>{const i=new Image();i.onload=()=>res(i);i.onerror=rej;i.src=URL.createObjectURL(file);});
  const max=1280, scale=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height); return c.toDataURL('image/jpeg',.72);
}
function openActivities(j){
  const list=['Spurgo','Aspirazione','Lavaggio alta pressione','Disotturazione','Videoispezione','Pulizia pozzetti','Pulizia fossa','Ricerca pozzetto','Pulizia tubazioni'];
  const pick=prompt(`Attività eseguita:\n${list.map((x,i)=>`${i+1}. ${x}`).join('\n')}\n\nScrivi numero o descrizione:`); if(!pick) return;
  const n=parseInt(pick,10), value=(n>=1&&n<=list.length)?list[n-1]:pick.trim(); j.activities=j.activities||[]; j.activities.push(value); saveDb(); renderWorking(j);
}
function addAnomaly(j){ const a=prompt('Descrivi l’anomalia rilevata:'); if(!a) return; j.anomalies=j.anomalies||[]; j.anomalies.push({text:a.trim(),at:nowIso(),status:'Da valutare'}); j.transcript=((j.transcript||'')+`\nAnomalia rilevata: ${a.trim()}`).trim(); saveDb(); renderWorking(j); }
function startVoice(j){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition; if(!SR) return alert('Il browser non espone il riconoscimento vocale. Su iPhone puoi usare il microfono della tastiera nel campo relazione.');
  const r=new SR(); r.lang='it-IT'; r.interimResults=false; r.onresult=e=>{ const t=e.results[0][0].transcript; j.transcript=((j.transcript||'')+' '+t).trim(); saveDb(); renderWorking(j); }; r.onerror=()=>alert('Dettatura non disponibile. Puoi usare il microfono della tastiera.'); r.start();
}
async function generateAiReport(j){
  j.transcript=document.getElementById('transcript').value.trim(); const st=document.getElementById('aiStatus'); if(!j.transcript && !(j.activities||[]).length) return st.textContent='Inserisci prima una breve descrizione o un’attività.';
  const s=getSettings(); st.textContent=s.aiEndpoint?'Generazione AI…':'Generazione locale Beta…';
  try{
    if(s.aiEndpoint){
      const r=await fetch(s.aiEndpoint,{method:'POST',headers:{'Content-Type':'application/json',...(s.aiToken?{'Authorization':`Bearer ${s.aiToken}`}:{})},body:JSON.stringify({client:j.client,issue:j.issue,transcript:j.transcript,activities:j.activities||[],anomalies:j.anomalies||[]})});
      if(!r.ok) throw new Error('Endpoint AI non disponibile'); const data=await r.json(); j.report=data.report||data.text||''; if(!j.report) throw new Error('Risposta AI senza report');
    } else j.report=localProfessionalReport(j);
    saveDb(); st.textContent='Relazione generata.'; document.getElementById('reportBox').innerHTML=`<div class="note report-note">${esc(j.report).replace(/\n/g,'<br>')}</div>`;
  }catch(e){ j.report=localProfessionalReport(j); saveDb(); st.textContent='Endpoint non disponibile: usata modalità locale.'; document.getElementById('reportBox').innerHTML=`<div class="note report-note">${esc(j.report).replace(/\n/g,'<br>')}</div>`; }
}
function localProfessionalReport(j){
  const acts=(j.activities||[]).length?`Attività eseguite: ${j.activities.join(', ')}.`:'';
  const an=(j.anomalies||[]).length?`\n\nANOMALIE RISCONTRATE\n${j.anomalies.map(x=>`- ${x.text}`).join('\n')}`:'';
  return `SITUAZIONE E INTERVENTO\n${j.transcript||`Intervento eseguito per: ${j.issue}.`}\n\nOPERAZIONI ESEGUITE\n${acts||'Le operazioni sono state eseguite secondo necessità riscontrate sul posto.'}${an}\n\nESITO\nIntervento documentato e registrato. Eventuali anomalie segnalate sono da sottoporre alla valutazione dell’ufficio.`;
}
function captureGps(j, alertResult){
  if(!navigator.geolocation){ if(alertResult) alert('Geolocalizzazione non supportata.'); return; }
  navigator.geolocation.getCurrentPosition(pos=>{ j.gps={lat:pos.coords.latitude,lng:pos.coords.longitude,accuracy:pos.coords.accuracy,at:nowIso()}; saveDb(); const g=document.getElementById('gpsMini'); if(g) g.textContent=`📍 GPS acquisito · ±${Math.round(j.gps.accuracy)} m`; if(alertResult) alert('Posizione GPS salvata nell’intervento.'); },()=>{ if(alertResult) alert('Posizione non disponibile o permesso negato.'); },{enableHighAccuracy:true,timeout:8000,maximumAge:30000});
}

function closeJob(j){
  j.transcript=document.getElementById('transcript')?.value.trim()||j.transcript||''; if(!j.report) j.report=localProfessionalReport(j); saveDb();
  const app=document.getElementById('app'); app.innerHTML=''; const mins=j.startedAt?Math.max(1,Math.round((Date.now()-new Date(j.startedAt).getTime())/60000)):0;
  app.append(el(`<div class="mobile-shell"><div class="mobile-header"><h1>Chiusura intervento</h1><div>${esc(j.client)}</div></div><div class="mobile-content"><div class="card"><div class="summary-grid"><div><span>Durata</span><strong>${mins} min</strong></div><div><span>Operatore</span><strong>${esc(currentUser().name)}</strong></div></div><div class="section-title"><h2>Relazione</h2></div><div class="note report-note">${esc(j.report).replace(/\n/g,'<br>')}</div><div class="field"><label>Nome firmatario</label><input id="signer" value="${esc(j.signer||'')}" placeholder="Es. Mario Rossi"></div><div class="field"><label>Firma cliente</label><canvas id="signaturePad" class="signature-pad"></canvas><div class="signature-actions"><button type="button" class="btn btn-secondary" id="clearSign">Cancella firma</button></div></div></div><button class="btn btn-success btn-block btn-large" style="margin-top:14px" id="confirmClose">CHIUDI E GENERA RAPPORTINO</button></div></div>`));
  setupSignaturePad(document.getElementById('signaturePad'), j.signature);
  document.getElementById('clearSign').onclick=()=>{ const c=document.getElementById('signaturePad'); c.getContext('2d').clearRect(0,0,c.width,c.height); };
  document.getElementById('confirmClose').onclick=()=>{ const c=document.getElementById('signaturePad'); j.signer=document.getElementById('signer').value.trim(); j.signature=c.toDataURL('image/png'); j.status='done'; j.endedAt=nowIso(); const date=new Intl.DateTimeFormat('it-IT').format(new Date()); j.history=j.history||[]; j.history.unshift(`${date} – ${j.issue}`); saveDb(); generatePdf(j); render(); };
}
function setupSignaturePad(canvas, previous){
  const ratio=Math.max(window.devicePixelRatio||1,1); const rect=canvas.getBoundingClientRect(); canvas.width=Math.round(rect.width*ratio); canvas.height=Math.round(160*ratio); const ctx=canvas.getContext('2d');ctx.scale(ratio,ratio);ctx.lineWidth=2;ctx.lineCap='round';ctx.strokeStyle='#0f172a';
  if(previous){const img=new Image();img.onload=()=>ctx.drawImage(img,0,0,rect.width,160);img.src=previous;}
  let drawing=false,last=null; const point=e=>{const r=canvas.getBoundingClientRect(),t=e.touches?.[0]||e;return{x:t.clientX-r.left,y:t.clientY-r.top}};
  const start=e=>{e.preventDefault();drawing=true;last=point(e)}; const move=e=>{if(!drawing)return;e.preventDefault();const p=point(e);ctx.beginPath();ctx.moveTo(last.x,last.y);ctx.lineTo(p.x,p.y);ctx.stroke();last=p}; const end=()=>drawing=false;
  canvas.addEventListener('pointerdown',start);canvas.addEventListener('pointermove',move);window.addEventListener('pointerup',end);canvas.addEventListener('touchstart',start,{passive:false});canvas.addEventListener('touchmove',move,{passive:false});canvas.addEventListener('touchend',end);
}

function renderDoneJob(j){
  const app=document.getElementById('app'); app.innerHTML='';
  app.append(el(`<div class="mobile-shell"><div class="mobile-header"><button class="btn btn-secondary" id="backToday">← Oggi</button><div class="pill pill-ok">COMPLETATO</div><h1>${esc(j.client)}</h1></div><div class="mobile-content"><div class="card"><h2>${esc(j.issue)}</h2><div class="note report-note">${esc(j.report||'').replace(/\n/g,'<br>')}</div><p><strong>Firmatario:</strong> ${esc(j.signer||'—')}</p>${j.signature?`<img class="signature-image" src="${j.signature}" alt="Firma cliente">`:''}<div class="photo-grid">${(j.photos||[]).map(p=>`<img src="${p.data}" alt="${esc(p.category)}">`).join('')}</div></div><button class="btn btn-primary btn-block btn-large" id="pdfBtn">📄 Scarica rapportino PDF</button></div></div>`));
  document.getElementById('backToday').onclick=render; document.getElementById('pdfBtn').onclick=()=>generatePdf(j);
}

async function generatePdf(j){
  const jsPDF=window.jspdf?.jsPDF; if(!jsPDF){ return printReport(j); }
  const s=getSettings(), doc=new jsPDF({unit:'mm',format:'a4'}), margin=16, width=178; let y=18;
  const addText=(text,size=10,bold=false)=>{doc.setFont('helvetica',bold?'bold':'normal');doc.setFontSize(size);const lines=doc.splitTextToSize(String(text||'—'),width);doc.text(lines,margin,y);y+=lines.length*(size*.42)+3;if(y>270){doc.addPage();y=18;}};
  doc.setFillColor(11,31,51);doc.rect(0,0,210,28,'F');doc.setTextColor(255,255,255);doc.setFontSize(20);doc.setFont('helvetica','bold');doc.text('SPURGO FLOW',16,18);doc.setTextColor(15,23,42);y=38;
  addText(s.companyName,14,true); addText(`RAPPORTINO INTERVENTO #${j.id}`,12,true); addText(`Cliente: ${j.client}`);addText(`Indirizzo: ${j.address}`);addText(`Telefono: ${j.phone||'—'}`);addText(`Operatore: ${operatorName(j.operatorId)}   Mezzo: ${j.vehicle||'—'}`);addText(`Intervento: ${j.issue}   Priorità: ${j.priority}`);
  y+=2;addText('RELAZIONE TECNICA',11,true);addText(j.report||j.transcript||'Nessuna relazione.');
  if(j.activities?.length){addText('ATTIVITÀ',11,true);addText(j.activities.map(x=>`• ${x}`).join('\n'));}
  if(j.anomalies?.length){addText('ANOMALIE',11,true);addText(j.anomalies.map(x=>`• ${x.text}`).join('\n'));}
  if(j.gps) addText(`GPS: ${j.gps.lat.toFixed(6)}, ${j.gps.lng.toFixed(6)} (precisione ±${Math.round(j.gps.accuracy)} m)`);
  if(j.photos?.length){addText('DOCUMENTAZIONE FOTOGRAFICA',11,true); for(const p of j.photos.slice(0,4)){if(y>215){doc.addPage();y=18;} try{doc.addImage(p.data,'JPEG',margin,y,70,52);doc.setFontSize(8);doc.text(p.category,margin,y+57);y+=64;}catch{}}}
  if(j.signer||j.signature){ if(y>220){doc.addPage();y=18;} addText(`Firmatario: ${j.signer||'—'}`,10,true); if(j.signature){try{doc.addImage(j.signature,'PNG',margin,y,65,28);y+=34;}catch{}} }
  doc.setFontSize(8);doc.setTextColor(100);doc.text('Documento generato da Spurgo Flow Beta',16,292);
  doc.save(`Rapportino_${j.id}_${safeFile(j.client)}.pdf`);
}
function safeFile(s){return String(s).normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/gi,'_').replace(/^_|_$/g,'');}
function printReport(j){ const w=window.open('','_blank'); if(!w) return alert('Impossibile aprire il rapportino. Consenti i popup e riprova.'); w.document.write(`<html><head><title>Rapportino ${j.id}</title><style>body{font-family:Arial;padding:28px;line-height:1.5}h1{border-bottom:3px solid #0f766e;padding-bottom:10px}.sig{max-width:260px}.photos img{width:45%;margin:5px}</style></head><body><h1>SPURGO FLOW</h1><h2>Rapportino #${j.id}</h2><p><b>Cliente:</b> ${esc(j.client)}<br><b>Indirizzo:</b> ${esc(j.address)}<br><b>Operatore:</b> ${esc(operatorName(j.operatorId))}</p><h3>Relazione tecnica</h3><p>${esc(j.report||'').replace(/\n/g,'<br>')}</p><div class="photos">${(j.photos||[]).map(p=>`<img src="${p.data}">`).join('')}</div><p><b>Firmatario:</b> ${esc(j.signer||'—')}</p>${j.signature?`<img class="sig" src="${j.signature}">`:''}<script>setTimeout(()=>print(),400)<\/script></body></html>`);w.document.close(); }

function renderSurvey(){
  const app=document.getElementById('app'); app.innerHTML='';
  app.append(el(`<div class="mobile-shell"><div class="mobile-header"><button class="btn btn-secondary" id="backToday">← Oggi</button><h1>Nuovo sopralluogo</h1><div>Raccolta rapida dati sul posto</div></div><div class="mobile-content"><form class="card" id="surveyForm"><div class="field"><label>Cliente</label><input id="sClient" required></div><div class="field"><label>Indirizzo</label><input id="sAddress" required></div><div class="field"><label>Situazione / problema</label><textarea id="sNotes" class="big-textarea" required></textarea></div><div class="field"><label>Soluzione proposta</label><textarea id="sSolution"></textarea></div><button class="btn btn-primary btn-block btn-large">SALVA SOPRALLUOGO</button></form></div></div>`)); document.getElementById('backToday').onclick=render;
  document.getElementById('surveyForm').onsubmit=e=>{e.preventDefault(); const u=currentUser(); state.db.jobs.push({id:Date.now(),client:document.getElementById('sClient').value.trim(),address:document.getElementById('sAddress').value.trim(),phone:'',email:'',issue:'Sopralluogo',time:new Date().toLocaleTimeString('it-IT',{hour:'2-digit',minute:'2-digit'}),status:'done',priority:'Normale',operatorId:u.id,vehicle:'',notes:document.getElementById('sNotes').value.trim(),history:[],permanent:'',photos:[],activities:['Sopralluogo'],anomalies:[],report:`SITUAZIONE RILEVATA\n${document.getElementById('sNotes').value.trim()}\n\nSOLUZIONE PROPOSTA\n${document.getElementById('sSolution').value.trim()||'Da definire con l’ufficio.'}`,transcript:document.getElementById('sNotes').value.trim(),gps:null,signer:'',signature:'',startedAt:nowIso(),endedAt:nowIso(),survey:true});saveDb();alert('Sopralluogo salvato e reso disponibile all’ufficio.');render();};
}
function renderOperatorHistory(){
  const u=currentUser(), done=state.db.jobs.filter(j=>j.operatorId===u.id && j.status==='done'); const app=document.getElementById('app');app.innerHTML='';app.append(el(`<div class="mobile-shell"><div class="mobile-header"><button class="btn btn-secondary" id="backToday">← Oggi</button><h1>Storico</h1><div>${done.length} interventi completati</div></div><div class="mobile-content">${done.map(j=>`<div class="mobile-job"><div class="pill">Completato</div><h3>${esc(j.client)}</h3><div class="meta">${esc(j.issue)}</div><button class="btn btn-secondary btn-block" data-done="${j.id}">Apri rapportino</button></div>`).join('')||'<div class="empty">Nessun intervento completato</div>'}</div></div>`));document.getElementById('backToday').onclick=render;document.querySelectorAll('[data-done]').forEach(b=>b.onclick=()=>renderDoneJob(getAuthorizedJob(Number(b.dataset.done))));
}

init();
