# Spurgo Flow 6.1 — attivazione multi-dispositivo

La webapp funziona anche senza Firebase in modalità locale. Per attivare la sincronizzazione reale tra PC, iPhone e altri dispositivi:

## 1. Crea il progetto Firebase
Apri Firebase Console, crea un progetto e registra una **Web App**.

## 2. Attiva Authentication
In **Authentication → Sign-in method**, abilita **Email/Password**.

## 3. Crea Cloud Firestore
Crea il database Firestore.

## 4. Installa le regole
Copia il contenuto di `firestore.rules` nelle regole di Cloud Firestore e pubblicale.

## 5. Configura la webapp
Apri `firebase-config.js`, incolla i valori del `firebaseConfig` fornito da Firebase e imposta:
`enabled: true`.

## 6. Crea l'utente Ufficio iniziale
In Firebase Authentication crea manualmente:
- Email: `ufficio@spurgoflow.app`
- Password: scegli la password Ufficio desiderata.

Copia l'UID dell'utente appena creato.

In Firestore crea il documento:
- Collection: `profiles`
- Document ID: **UID dell'utente Ufficio**
- Campi:
  - `role` = `office`
  - `username` = `ufficio`
  - `active` = `true`

Questo è l'unico bootstrap manuale necessario.

## 7. Pubblica su GitHub Pages
Carica tutti i file del pacchetto.

Al primo accesso cloud dell'Ufficio, se le raccolte sono vuote, Spurgo Flow carica automaticamente i dati iniziali della demo nel database.

## 8. Crea gli operatori dall'app
Da **Ufficio → Operatori & Squadre**, crea un operatore con username e password. Spurgo Flow creerà:
- account Firebase Authentication;
- profilo autorizzato;
- scheda operatore Firestore.

L'operatore potrà quindi accedere da un altro smartphone usando lo stesso username e password.

## Login
Spurgo Flow converte internamente lo username in un account tecnico:
`username@spurgoflow.app`.

L'operatore continua quindi a digitare solamente **username + password** nell'interfaccia.

## Sincronizzazione
Sono sincronizzati in tempo reale:
- operatori;
- squadre;
- clienti;
- mezzi;
- interventi e agenda;
- messaggi Ufficio ↔ operatore.

La modalità locale resta disponibile se `enabled` è `false`.
