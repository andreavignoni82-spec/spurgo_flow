# Spurgo Flow — Beta v0.3 Premium

Versione dimostrativa PWA pronta per **GitHub Pages**.

## Credenziali demo
- Ufficio: `ufficio` / `ufficio123`
- Operatore Marco: `marco` / `marco123`
- Operatore Luca: `luca` / `luca123`

## Novità v0.3
- Nuova identità grafica blu navy / verde e nuova icona PWA
- Login ridisegnato
- Dashboard Ufficio in stile gestionale professionale con menu laterale
- Area operatore smartphone-first mantenuta e aggiornata
- Accesso personale per ogni operatore: ciascuno vede solo i propri interventi
- Fotografie Prima / Durante / Dopo / Anomalia
- GPS, navigazione, dettatura, attività, anomalie e firma cliente
- Nuovo template A4 del rapportino PDF
- Invio/condivisione del rapportino dopo la chiusura
- Pulsanti E-mail, WhatsApp, Condividi PDF e Download PDF
- Condivisione nativa del PDF su smartphone compatibili (Mail, WhatsApp, AirDrop, ecc.)
- Storico cliente e memoria tecnica
- Sopralluogo rapido
- PWA installabile con icone 192/512

## Nota su E-mail e WhatsApp
Su iPhone/Android compatibili, il browser usa la Web Share API e condivide il **file PDF reale** tramite il menu nativo: l'utente può scegliere Mail, WhatsApp, AirDrop o altre app installate.

Su browser che non consentono la condivisione diretta dei file:
- E-mail apre un messaggio precompilato;
- WhatsApp apre una chat/messaggio precompilato;
- il PDF resta scaricabile separatamente.

L'invio automatico senza interazione dell'utente richiederà, nella futura versione produzione, un backend SMTP e/o WhatsApp Business API.

## Pubblicazione su GitHub Pages
1. Crea un repository GitHub.
2. Carica **tutti i file di questa cartella nella root** del repository.
3. Apri `Settings > Pages`.
4. In `Build and deployment`, scegli `Deploy from a branch`.
5. Scegli branch `main` e cartella `/ (root)`.
6. Salva e apri l'URL fornito da GitHub Pages.

## File principali
- `index.html`
- `style.css`
- `app.js`
- `manifest.json`
- `sw.js`
- `icon.svg`
- `icon-192.png`
- `icon-512.png`

## Sicurezza della Beta
Questa versione è ancora statica e salva dati tramite `localStorage/sessionStorage`. Le password sono hashate lato browser, ma la separazione degli utenti non sostituisce l'autenticazione server-side. La vera versione multi-dispositivo dovrà spostare login, permessi, interventi, foto e rapportini su un backend con regole di autorizzazione.
