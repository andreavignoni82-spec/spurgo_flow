# Spurgo Flow — Suite Beta v5.0

**Current modular release:** `v7.0.0-alpha.8 · CONTROL ROOM MODULE`. Control Room is now an autonomous v7 monitor backed by InterventionsService, OperatorsRepository, TeamsRepository, VehiclesRepository and PlanningService. Reassignment writes use only InterventionsService; planning and maps degrade independently. Rapportini and App Operatore remain on the v6.1.21-R1 compatibility application.
Build 5.0.13

Prototipo GitHub Pages della suite aziendale Spurgo Flow.

## Credenziali demo
- Ufficio: `ufficio` / `ufficio123`
- Operatore Marco: `marco` / `marco123`
- Operatore Luca: `luca` / `luca123`

## Moduli v5
Dashboard, Control Room, interventi, agenda, clienti & impianti, mezzi & flotta, squadre & operatori, rapportini, KPI.

## Pubblicazione
Caricare **tutto il contenuto di questa cartella** nella root del repository GitHub, poi attivare GitHub Pages da Settings > Pages.

> Questa è una demo statica. Sincronizzazione reale multi-dispositivo, autenticazione server, invio automatico email/WhatsApp con allegati e portale QR cliente richiederanno il backend previsto nella fase successiva.


## Correzioni build 5.0.13
- Login corretto con riferimenti DOM espliciti.
- Badge versione ridotto e non invasivo.
- Cache PWA aggiornata.

- Ripristinata icona PWA navy/autobotte della versione precedente.

## Build 5.0.13
- Ripristinati i flussi operatore nella stessa pagina come v0.4.
- Foto Prima/Durante/Dopo con fotocamera o libreria.
- Relazione libera + dettatura + generazione relazione.
- Attività selezionabili e quantità operative.
- Anomalia con priorità, testo e foto.
- Firma operatore su schermo.
- Tutti i dati alimentano il rapportino finale.

## Build 5.0.13 — configurazione operatore consolidata
- Tutto il flusso resta nella stessa pagina.
- Descrizione libera predisposta per futura ottimizzazione AI.
- Foto, attività e anomalie inline.
- Firma operatore e firma cliente direttamente sullo smartphone.
- Rapportino completo con QR reale predisposto per futuro portale intervento.
- Stampa/Salva PDF e condivisione Email/WhatsApp/menu nativo.

## Build 5.0.13 — Ultra-operativa smartphone
- Pannelli Foto, Relazione, Attività e Anomalia espandibili nella stessa pagina.
- Su smartphone resta aperto un pannello alla volta per ridurre lo scorrimento.
- Riepilogo rapido dello stato di compilazione.
- Barra firme sempre accessibile in basso.
- Accesso immediato a firma operatore e cliente.
- Pulsante fisso Termina e genera rapportino.

## Build 5.0.13
- Barra fissa operatore: Interventi, Agenda, Mappa, Messaggi, Profilo.
- Sezioni separate con navigazione persistente.
- Intervento/timer restano attivi durante la navigazione.
- Ritorno rapido all'intervento in corso.
- Agenda giornaliera, mappa/percorso, messaggi ufficio e profilo operatore demo.

## Build 5.0.13
- Selezione libera dell'intervento, indipendente da urgenza/orario.
- Scheda intervento operativa nello stile della seconda immagine.
- Firme operatore/cliente corrette con pad firma dedicato full-screen/modal.
- Chiusura intervento reale: valida le firme, arresta timer, chiude scheda e genera rapportino.
- Rapportino ridisegnato compatto A4: cliente, intervento, posizione/mappa, attività, richiesta, anomalie, relazione, 4 foto, firme, QR e invio.

## Build 5.0.13
- Mappe reali OpenStreetMap/Leaflet nella dashboard ufficio, Control Room, area Mappa operatore e scheda intervento.
- Marker reali per gli interventi demo e navigazione esterna Google Maps.
- Mappa reale anche nel rapportino.
- Rapportino reimpaginato sulla struttura della foto di riferimento: testata/logo/QR, dati cliente e intervento, posizione+mappa, attività, anomalie, richiesta cliente, relazione, 4 foto, firme e blocco invio.
- Ottimizzazione stampa A4 su una pagina.

## Build 5.0.13
- Mappe responsive ottimizzate su smartphone, tablet e desktop.
- Fit automatico dei marker e comandi Mostra tutti / Centra intervento.
- Correzione resize Leaflet quando si cambia sezione.
- Interventi apribili direttamente dall'Agenda.
- Scelta intervento sempre libera.
- Sezione Interventi terminati.
- Possibilità di riaprire un intervento terminato, modificarlo e rigenerare il rapportino.
- Il nuovo rapportino sostituisce/aggiorna la versione operativa dell'intervento demo.

## Build 5.0.13
- Rimosso dal PDF/stampa tutto il blocco Invio rapportino.
- Le azioni PDF/Email/WhatsApp/Condividi restano disponibili solo nell'interfaccia app.
- Mappa rapportino ricreata e centrata prima della stampa.
- Zoom fisso e invalidateSize per evitare riquadri mappa vuoti o tagliati.

## Build 5.0.13
- Eliminata la logica delle coordinate demo come posizione autorevole.
- Geocodifica reale dell'indirizzo tramite OpenStreetMap Nominatim.
- Lo stesso indirizzo/coordinate alimenta scheda intervento, mappe, Control Room e rapportino.
- Pulsante Localizza indirizzo.
- Possibilità di usare la posizione GPS dello smartphone come punto operativo.
- Possibilità di correggere manualmente il punto operativo toccando la mappa.
- Navigazione usa il punto operativo, se presente; altrimenti usa le coordinate dell'indirizzo.
- Il rapportino distingue coordinate dell'indirizzo e punto operativo corretto.

## Build 5.0.13
- Ufficio crea operatori con username/password dedicati.
- Modifica, cambio password, attiva/disattiva, elimina operatore.
- Assegna mezzo e ruolo.
- Crea, modifica ed elimina squadre.
- Assegna uno o più operatori alle squadre.
- Gli operatori creati dall'Ufficio possono accedere subito con le proprie credenziali nella demo locale.

## FIX1 - audit completo archivio
- Ripristinate variabili/funzioni eliminate nel pacchetto GPS Safe corrotto.
- Ripristinati demoJobs, selectedJob, completedJobs, selezione Agenda e riapertura interventi.
- Eliminato riferimento fieldMapObj non definito nella navigazione.
- Geocodifica con cache locale e GPS ad alta precisione.
- Leaflet inizializzato solo su contenitori visibili; resize dopo apertura sezione e rotazione.
- Mappa scheda intervento e rapportino non vengono più distrutte/ricreate inutilmente.
- Rimossi app.js/style.css/manifest.json non utilizzati e appartenenti a un'altra architettura.
- JavaScript verificato sintatticamente con Node; controllati handler, ID duplicati e riferimenti mancanti.

## Spurgo Flow 6.0.0 — Office operativo

Baseline utilizzata: Spurgo Flow 5.0.13 FIX1 stabile.

### Funzioni Ufficio
- Interventi: creazione, modifica, eliminazione, duplicazione, ricerca e filtri.
- Assegnazione intervento a singolo operatore e mezzo.
- Agenda: data, orario e filtro per operatore, con apertura della scheda.
- Clienti: creazione/modifica/eliminazione, contatti, referente, impianti/note e nuovo intervento dal cliente.
- Mezzi: creazione/modifica/eliminazione, tipologia, targa, capacità, stato, ore/km e manutenzione.
- Operatori e Squadre: conserva e integra il sistema della baseline FIX1.
- Messaggi: conversazione individuale Ufficio ↔ Operatore, badge dei non letti e risposta dell'operatore.

### Area operatore
- L'elenco Interventi viene alimentato dalle assegnazioni effettuate dall'Ufficio.
- Agenda alimentata dagli interventi assegnati.
- Messaggi individuali dell'Ufficio con possibilità di risposta.
- Badge dei messaggi non letti.

### Persistenza Beta
La versione GitHub usa localStorage: dati e messaggi sono persistenti sullo stesso browser/dispositivo.
La sincronizzazione reale tra dispositivi sarà il passaggio successivo con database/backend condiviso.

## Spurgo Flow 6.1.0 — Multi-dispositivo
- Firebase Authentication per utenti Ufficio/operatori.
- Cloud Firestore per dati condivisi.
- Listener realtime per interventi, agenda e messaggi.
- Creazione account operatore direttamente dall'Ufficio tramite una seconda istanza Firebase Auth.
- Firestore Security Rules incluse.
- Bootstrap automatico dei dati iniziali dopo il primo login Ufficio.
- Modalità locale di fallback se Firebase non è configurato.
- Guida completa: `SETUP_FIREBASE.md`.

## 6.1.2 — Login Fix
- Corretto errore sintattico `async function logoutfunction logout()` presente nella 6.1.1.
- Ripristinata esecuzione del JavaScript principale.
- Firebase può ora inizializzarsi e aggiornare lo stato Cloud.
- Logout cloud corretto.
- Nuova cache service worker per evitare il riutilizzo dell'index.html difettoso.
- `firebase-config.js` dell'utente mantenuto invariato.

## 6.1.3 — Data Layer Fix
- Ripristinate le variabili mancanti `sfClients`, `sfVehicles`, `sfOfficeInterventions`, `sfMessages`.
- Ripristinati i dati iniziali Clienti, Mezzi, Interventi e Messaggi.
- Snapshot cloud reso tollerante a collezioni non inizializzate.
- Firebase config dell'utente mantenuto invariato.
- Nuova cache service worker.

## 6.1.4 — Operatori & Login Fix
- Ripristinate: modifica operatore, cambio password, attiva/disattiva, elimina operatore.
- Ripristinate: crea/modifica/elimina squadra.
- Cancellazione cloud completa Authentication + profilo + documento operatore quando è disponibile un account Firebase.
- Protezione: impossibile eliminare un operatore con interventi attivi assegnati.
- Corretto il listener realtime del nuovo operatore: ora ascolta direttamente il documento Firestore.
- Rimossa la query errata su `__name__`.

## 6.1.5 — Client Save Fix
- `Salva cliente` riscritto cloud-first.
- In modalità Firebase il documento cliente viene scritto direttamente in `clients/{id}` prima di chiudere il modulo.
- Se Firestore rifiuta il salvataggio, il modulo resta aperto e mostra l'errore reale.
- Eliminazione cliente sincronizzata direttamente con Firestore.
- LocalStorage aggiornato solo dopo successo cloud.

## 6.1.6 — Full Office Audit
Confronto eseguito con la 6.0.0 stabile.

Funzioni ripristinate:
- `saveV6`
- `renderClients`
- `newInterventionForClient`
- `openVehicleModal`
- `deleteClient`

Clienti:
- salvataggio diretto Firestore quando disponibile;
- fallback compatibile con `syncFromGlobals`;
- nessun crash se Safari carica temporaneamente un modulo cloud precedente.

Cache:
- `index.html`, `firebase-config.js`, `firebase-sync.js` e navigazioni non vengono più serviti dalla cache applicativa;
- `skipWaiting()` + `clients.claim()` per attivare subito il nuovo service worker.

## 6.1.8 — PDF reale + ArcGIS
Base: 6.1.6 stabile.

### Geolocalizzazione
- Eliminato Geoapify e relativa API key.
- Nuovo servizio: ArcGIS World Geocoder pubblico `findAddressCandidates`.
- Nessuna chiave API necessaria nella configurazione Spurgo Flow.
- Ricerca limitata all'Italia, fino a 8 candidati.
- Priorità a `PointAddress`, poi `StreetAddress`.
- Civico esatto privilegiato nel ranking.
- Se il civico non è confermato, l'app lo segnala esplicitamente.

### Rapportino
- PDF generato realmente lato browser con jsPDF + html2canvas.
- `GENERA PDF` apre il PDF su iPhone/Safari.
- `E-MAIL / CONDIVIDI PDF` usa Web Share API con file PDF, permettendo di scegliere Mail su iPhone.
- Fallback a apertura PDF + mailto sui browser che non supportano file sharing.

## 6.1.9 — Live Operations
Base stabile: 6.1.8.

- Testo messaggi operatore nero.
- Dashboard alimentata dai dati reali interventi/Firebase.
- Control Room alimentata da operatori e squadre attivi reali.
- "Assegna squadra" operativo con scelta squadra, responsabile e mezzo.
- Ogni operatore vede solo le proprie commesse.
- Agenda e mappa operatore filtrate sulle proprie commesse.
- Storico terminati/rapportini operatore filtrato per account.
- Archivio Ufficio Rapportini alimentato dai rapportini realmente generati.
- Snapshot del rapportino salvato nel documento intervento Firestore (`reportData`), senza nuove regole Firebase.

## 6.1.10 — Le mie commesse
Base: 6.1.9.

- L'operatore vede esclusivamente gli interventi assegnati al proprio `operatorId` o alla propria squadra.
- Nessuna commessa viene selezionata automaticamente.
- Schermata "Le mie commesse" con scelta esplicita tramite "Apri commessa".
- Agenda filtrata sulle sole commesse dell'operatore.
- Mappa filtrata sulle sole commesse attive dell'operatore.
- Storico/rapportini già filtrati per operatore.
- Blocco applicativo se si tenta di aprire un intervento non assegnato.
- Pulizia della commessa salvata in sessione se appartiene a un altro account.

## 6.1.11 — Agenda Redesign
Base: 6.1.10.

### Operatore
- Vista giornaliera compatta.
- Fascia di 7 giorni navigabile.
- Cambio giorno rapido.
- Solo interventi assegnati all'operatore.
- Schede con orario, cliente, indirizzo, attività e stato.
- Apertura diretta della commessa.

### Ufficio
- Vista Giorno con timeline 07:00–18:00 per operatori.
- Vista Settimana.
- Filtri per operatore, squadra, stato e mezzo.
- Pannello dettaglio intervento.
- Modifica intervento e messaggio all'operatore dal dettaglio.
- Dati alimentati da Firebase/data layer esistente.

## 6.1.13 — Map / Modal z-index Fix
Base: 6.1.12.

- Corretto stacking context di Leaflet.
- Dashboard: la mappa non può più sovrapporsi alla scheda intervento.
- Control Room: la mappa non può più sovrapporsi alla scheda intervento.
- Popup e controlli Leaflet confinati sotto il livello UI.
- Modali forzate sopra tutti i layer cartografici.

## 6.1.14 — Interventi
Base: 6.1.13.

- Scheda Interventi: filtro data impostato automaticamente sul giorno corrente.
- Nuovo campo `estimatedMinutes` / Tempo stimato.
- Tempo stimato mostrato in elenco e dettaglio.
- Assegnazione a uno o più operatori.
- Assegnazione a squadra.
- Possibilità di combinare squadra + operatori specifici.
- Se si sceglie una squadra senza operatori manuali, vengono assegnati gli operatori attivi della squadra.
- `operatorId` resta il responsabile primario per compatibilità; `assignedOperatorIds` contiene tutti gli operatori assegnati.

## 6.1.15 — Interventions Render Fix
Base: 6.1.14.

- Corretto il renderer della sezione Interventi: usa la struttura reale `officeInterventionList`.
- Ripristinata visualizzazione interventi.
- Filtro data di default sul giorno corrente mantenuto.
- Tempo stimato mantenuto.
- Multi-assegnazione operatori/squadre mantenuta.
- Righe intervento nuovamente cliccabili.
- Dashboard e Control Room continuano ad aprire il dettaglio dello stesso record intervento.

Test integrazione Codex GitHub - 13/08/2026

## 6.1.18 — Ottimizzazione grafica e operativa Agenda
Base: 6.1.17.

- Orario e operatore/squadra diventano gli elementi dominanti delle schede Agenda.
- Vista giornaliera più compatta, ordinata cronologicamente e ottimizzata per smartphone.
- Colori persistenti per risorsa convertiti in una palette pastello professionale.
- Cliente, indirizzo, tipologia e stato restano disponibili in forma secondaria compatta.
- Vista settimanale e Agenda operatore adottano la stessa gerarchia visiva.
- Invariati Firebase, autenticazione, sincronizzazione realtime e refresh Messaggi/Rapportini ogni 30 secondi.
## 6.1.19 — Riprogettazione completa scheda Agenda
Base: 6.1.18.

- Agenda a tutta larghezza con soli controlli data, Oggi e Giorno/Settimana.
- Vista Giorno trasformata in timeline operativa 06:00–20:00 con righe sticky per operatori e squadre.
- Interventi posizionati in base all'orario e dimensionati con la durata stimata quando disponibile.
- Click diretto sul blocco per aprire Modifica intervento, senza pannello dettagli separato.
- Vista Settimana compatta, palette pastello persistente e layout responsive con scorrimento orizzontale.
- Invariati Firebase, autenticazione, sincronizzazione e refresh Messaggi/Rapportini ogni 30 secondi.

## 6.1.20 — Control Room, dispatch operativo dinamico

- Control Room responsive a tutta larghezza con risorse, timeline giornaliera, viaggi, margini e criticità live.
- Motore di planning deterministico e riutilizzabile con durata tecnica di fallback, stima geografica prudenziale dei viaggi e propagazione di anticipi/ritardi.
- Urgenze prioritarie, suggerimenti fino a tre risorse e riassegnazione solo dopo conferma dell’ufficio, sugli stessi interventi sincronizzati dell’Agenda.


## 6.1.21 — Smart Slot & Route Planner

> **Recovery v6.1.21-R1:** codice applicativo ripristinato integralmente dal commit `0a4cad6849798ac0adc5791e59b3ec0aabf62b08`; rollback limitato al codice, senza modifiche ai dati Firebase.

- Motore centrale `findBestSlots` con buffer e orari operativi configurabili, cache temporanea delle tratte, scoring deterministico di percorso completo, margini, impatto e bilanciamento.
- Pianificazione intelligente nei form nuovo/modifica: fino a tre proposte, anteprima prima/nuovo/dopo e applicazione al form senza salvataggio automatico.
- Supporto per urgenze, appuntamenti fissi, fasce preferite e fallback dichiarato per coordinate incomplete.
- Inserimento rapido dalla Control Room, collegato allo stesso motore e al normale form precompilato.
- Agenda e Control Room si aggiornano dagli stessi interventi condivisi dopo il salvataggio.
