# Spurgo Flow — Beta v0.2

PWA dimostrativa per aziende di spurghi, pronta per GitHub Pages.

## Credenziali demo
- Ufficio: `ufficio` / `ufficio123`
- Operatore Marco: `marco` / `marco123`
- Operatore Luca: `luca` / `luca123`

L'area Ufficio può creare altri operatori e cambiare le password.

## Funzioni v0.2
- Login individuale con password hashata SHA-256
- Area Ufficio e area Operatore separate
- Ogni operatore vede esclusivamente gli interventi assegnati al proprio ID
- Creazione e assegnazione interventi
- Agenda operatori
- Avvio/ripresa/chiusura intervento con durata
- Fotocamera/file reali con categorie PRIMA/DURANTE/DOPO/ANOMALIA
- Compressione foto nel browser
- GPS reale e collegamento OpenStreetMap
- Dettatura browser/tastiera
- Attività e anomalie
- Relazione professionale locale + endpoint AI opzionale
- Firma cliente su canvas touch
- Rapportino PDF con jsPDF (fallback stampa PDF)
- Storico cliente e memoria tecnica
- Sopralluogo rapido
- PWA installabile + service worker

## Pubblicazione GitHub Pages
1. Crea un nuovo repository pubblico o privato compatibile con Pages.
2. Carica nella root: `index.html`, `app.js`, `style.css`, `manifest.json`, `sw.js`, `README.md`.
3. Repository > Settings > Pages.
4. Source: Deploy from a branch.
5. Branch: `main`, cartella `/ (root)`.
6. Apri l'URL Pages generato da GitHub.

## Nota sicurezza
Questa Beta è volutamente senza backend. Password, interventi, foto e firme restano nel browser del dispositivo tramite localStorage/sessionStorage. Le password sono hashate, ma un'app statica non offre sicurezza multiutente reale né sincronizzazione tra dispositivi. Per una versione cliente/produzione è necessario spostare autenticazione e dati su un backend (es. Firebase/Supabase/API proprietaria) con autorizzazioni server-side.

## AI
La Beta non contiene chiavi API. In Ufficio > Impostazioni puoi inserire l'URL di un endpoint proxy/Worker che riceva JSON e restituisca `{ "report": "..." }`. Se non configurato, la relazione viene generata localmente senza costi.
