import { VERSION } from '../../app/version.js';

const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const userIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="7" r="4"/><path d="M5 21v-2a7 7 0 0 1 14 0v2"/></svg>';
const lockIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>';
const eyeIcon='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12z"/><circle cx="12" cy="12" r="3"/></svg>';

export const loginFeature={
  id:'login',root:null,dead:false,
  async mount(container,c){
    this.root=container;this.dead=false;
    container.innerHTML=`<main class="login-page"><section class="login-card"><div class="login-visual" aria-hidden="true"><img src="./assets/spurgo-flow-brand-3d.svg" alt=""></div><section class="login-panel"><h2 class="login-claim">Gestisci i tuoi interventi<br>in modo semplice e veloce</h2><form class="login-form"><label class="login-field"><span class="login-field-icon">${userIcon}</span><input name="username" autocomplete="username" required placeholder="Utente" aria-label="Utente"></label><label class="login-field"><span class="login-field-icon">${lockIcon}</span><input name="password" type="password" autocomplete="current-password" required placeholder="Password" aria-label="Password"><button type="button" class="login-eye" data-toggle-password aria-label="Mostra password">${eyeIcon}</button></label><p class="login-error" role="alert" hidden></p><button class="login-submit" type="submit">ACCEDI</button><button class="login-forgot" type="button" data-forgot>Password dimenticata?</button></form><div class="login-divider"><span></span><strong>SPURGO <b>FLOW</b></strong><span></span></div><div class="login-build"><span>${esc(VERSION)}</span><small>Build ${esc(VERSION.replace(/^v/,''))}</small></div></section><footer class="login-footer">© 2025 SPURGO FLOW – Tutti i diritti riservati</footer></section></main>`;
    const form=container.querySelector('.login-form');
    container.onclick=e=>{
      if(e.target.closest('[data-toggle-password]')){const input=form.elements.password;input.type=input.type==='password'?'text':'password';}
      if(e.target.closest('[data-forgot]')){const error=container.querySelector('.login-error');error.textContent='Per reimpostare la password contatta l’amministratore Spurgo Flow.';error.hidden=false;}
    };
    form.onsubmit=async e=>{
      e.preventDefault();const error=container.querySelector('.login-error');error.hidden=true;
      const username=form.elements.username.value.trim(),password=form.elements.password.value;
      try{const identity=await c.services.auth.login(username,password);await c.router.navigate(identity.role==='operator'?'operator':'dashboard');}
      catch(err){error.textContent=err?.message||'Accesso non riuscito. Verifica utente e password.';error.hidden=false;}
    };
  },
  unmount(){this.dead=true;if(this.root){this.root.onclick=null;const f=this.root.querySelector('.login-form');if(f)f.onsubmit=null;}this.root=null;}
};