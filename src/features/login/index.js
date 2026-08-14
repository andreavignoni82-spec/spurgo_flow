import { VERSION } from '../../app/version.js';

const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

export const loginFeature = {
  id: 'login', root: null, dead: false,
  async mount(container, c) {
    this.root = container; this.dead = false;
    container.innerHTML = `<main class="login-page"><section class="login-card"><img class="login-logo" src="./assets/spurgo-flow-logo.svg" alt="Spurgo Flow"><div class="login-brand"><h1>SPURGO <b>FLOW</b></h1><p>Gestione interventi di spurgo</p></div><div class="login-role" role="tablist"><button class="active" type="button" data-login-role="office">UFFICIO</button><button type="button" data-login-role="operator">OPERATORE</button></div><form class="login-form"><label>Utente o email<input name="username" autocomplete="username" required placeholder="Inserisci utente"></label><label>Password<div class="login-password"><input name="password" type="password" autocomplete="current-password" required placeholder="Inserisci password"><button type="button" data-toggle-password aria-label="Mostra password">◉</button></div></label><p class="login-error" role="alert" hidden></p><button class="login-submit" type="submit">ACCEDI</button></form><small class="login-version">${esc(VERSION)}</small></section></main>`;
    let role = 'office';
    const form = container.querySelector('.login-form');
    container.onclick = e => {
      const roleButton = e.target.closest('[data-login-role]');
      if (roleButton) { role = roleButton.dataset.loginRole; container.querySelectorAll('[data-login-role]').forEach(x => x.classList.toggle('active', x === roleButton)); }
      if (e.target.closest('[data-toggle-password]')) { const input=form.elements.password; input.type=input.type==='password'?'text':'password'; }
    };
    form.onsubmit = async e => {
      e.preventDefault(); const error = container.querySelector('.login-error'); error.hidden = true;
      const username = form.elements.username.value.trim(), password = form.elements.password.value;
      try {
        if (role === 'office') {
          if (c.environment?.driver === 'memory') { if (username !== 'ufficio' || password !== 'ufficio') throw new Error('Credenziali Ufficio non valide'); await c.services.auth.loginOffice(username, password); }
          else await c.services.auth.loginOffice(username, password);
          await c.router.navigate('dashboard');
        } else {
          await c.services.auth.loginOperator(username, password);
          await c.router.navigate('operator');
        }
      } catch (err) { error.textContent = err?.message || 'Accesso non riuscito'; error.hidden = false; }
    };
  },
  unmount() { this.dead=true; if(this.root){this.root.onclick=null; const f=this.root.querySelector('.login-form'); if(f)f.onsubmit=null;} this.root=null; }
};
