import { VERSION } from '../../app/version.js';
export { todayISO } from '../selectors/operations.js';
export const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const icons={
 dashboard:'<path d="M3.5 10.5 12 3l8.5 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-4.5v-6h-5v6H5a1.5 1.5 0 0 1-1.5-1.5z"/>',
 clients:'<circle cx="9" cy="8" r="3.2"/><path d="M3.5 20.5v-1.4A5.6 5.6 0 0 1 9 13.5a5.6 5.6 0 0 1 5.5 5.6v1.4M16 5.2a3.3 3.3 0 0 1 0 6.4M17 14.2a5.1 5.1 0 0 1 3.5 4.9v1.4"/>',
 fleet:'<path d="M2.8 7h11.8v8.8H2.8zM14.6 10h3.6l3 3.4v2.4h-6.6z"/><circle cx="7" cy="18" r="2.1"/><circle cx="18" cy="18" r="2.1"/><path d="M5 10h5M16.5 12.5h2.2"/>',
 people:'<circle cx="12" cy="7.4" r="3.6"/><path d="M4.8 21v-1.6A7.2 7.2 0 0 1 12 12.2a7.2 7.2 0 0 1 7.2 7.2V21"/><path d="M8.5 14.2 12 17l3.5-2.8"/>',
 interventions:'<rect x="4" y="4.5" width="16" height="16" rx="2"/><path d="M8 3v4M16 3v4M7.5 10.5h9M8 14h3M8 17h5"/>',
 agenda:'<rect x="3" y="5" width="18" height="16" rx="2.3"/><path d="M7 3v4M17 3v4M3 10h18M7.5 14h3M13.5 14h3M7.5 18h3"/>',
 control:'<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6"/><path d="M12 3.5V6M20.5 12H18M12 20.5V18M3.5 12H6M17.8 6.2 16 8M6.2 17.8 8 16"/>',
 messages:'<path d="M4 5h16v11.5H9l-5 4z"/><path d="M8 9h8M8 12.5h5"/>',
 reports:'<path d="M6 3.5h8.5L19 8v12.5H6z"/><path d="M14.5 3.5V8H19M9 12h6M9 15.5h6M9 19h4"/>',
 statistics:'<path d="M4 20.5v-7h4v7M10 20.5v-12h4v12M16 20.5V5h4v15.5M3 20.5h18"/>'
};
export const uiIcon=(k,cls='')=>`<svg class="${cls}" viewBox="0 0 24 24" aria-hidden="true">${icons[k]??icons.dashboard}</svg>`;
const routes=[['dashboard','dashboard','Dashboard'],['clients','clients','Clienti'],['fleet','fleet','Mezzi'],['people','people','Operatori'],['interventions','interventions','Interventi'],['agenda','agenda','Agenda'],['control-room','control','Control Room'],['messages','messages','Messaggi'],['reports','reports','Rapportini'],['statistics','statistics','Statistiche']];
const nav=id=>routes.map(([r,i,l])=>`<button data-route="${r}" ${r===id?'aria-current="page"':''}>${uiIcon(i)}<span>${l}</span></button>`).join('');
export const shell=(title,body,id='operations')=>`<main class="ops" data-feature="${id}"><header class="ops-head"><div class="ops-top"><div class="ops-brand"><img src="./assets/spurgo-flow-brand-3d.svg" alt="Spurgo Flow - Gestione interventi di spurgo"></div><div class="ops-tools"><span class="ops-version">${VERSION}</span><span class="ops-avatar">SF</span></div></div><nav class="ops-nav" aria-label="Navigazione principale">${nav(id)}</nav></header><section class="ops-page-head"><div><h1>${esc(title)}</h1><p>${id==='dashboard'?'Panoramica operativa di oggi':'Gestione operativa Spurgo Flow'}</p></div></section><div class="ops-content">${body}</div></main>`;
export const loading=title=>shell(title,'<section class="ops-card" role="status">Caricamento…</section>');
export const empty=text=>`<p class="empty">${esc(text)}</p>`;
export const statusLabel=s=>({PROGRAMMATO:'Programmato',IN_CORSO:'In corso',TERMINATO:'Terminato',ANNULLATO:'Annullato',RIAPERTO:'Riaperto'}[s]??s);
export function createReadFeature(id,title,load,render){let root,dead=false;return Object.freeze({id,async mount(container,context){root=container;dead=false;root.innerHTML=loading(title);try{const data=await load(context);if(!dead)root.innerHTML=shell(title,render(data,context),id);}catch(e){context.logger?.error(`${id} failed`,{error:e});if(!dead)root.innerHTML=shell(title,`<section class="ops-card error" role="alert">${esc(e.message||'Errore di caricamento')}</section>`,id);}},unmount(){dead=true;root=undefined;}});}
