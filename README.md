# Spurgo Flow — Suite Beta v5.0
Build 5.0.12

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


## Correzioni build 5.0.12
- Login corretto con riferimenti DOM espliciti.
- Badge versione ridotto e non invasivo.
- Cache PWA aggiornata.

- Ripristinata icona PWA navy/autobotte della versione precedente.

## Build 5.0.12
- Ripristinati i flussi operatore nella stessa pagina come v0.4.
- Foto Prima/Durante/Dopo con fotocamera o libreria.
- Relazione libera + dettatura + generazione relazione.
- Attività selezionabili e quantità operative.
- Anomalia con priorità, testo e foto.
- Firma operatore su schermo.
- Tutti i dati alimentano il rapportino finale.

## Build 5.0.12 — configurazione operatore consolidata
- Tutto il flusso resta nella stessa pagina.
- Descrizione libera predisposta per futura ottimizzazione AI.
- Foto, attività e anomalie inline.
- Firma operatore e firma cliente direttamente sullo smartphone.
- Rapportino completo con QR reale predisposto per futuro portale intervento.
- Stampa/Salva PDF e condivisione Email/WhatsApp/menu nativo.

## Build 5.0.12 — Ultra-operativa smartphone
- Pannelli Foto, Relazione, Attività e Anomalia espandibili nella stessa pagina.
- Su smartphone resta aperto un pannello alla volta per ridurre lo scorrimento.
- Riepilogo rapido dello stato di compilazione.
- Barra firme sempre accessibile in basso.
- Accesso immediato a firma operatore e cliente.
- Pulsante fisso Termina e genera rapportino.

## Build 5.0.12
- Barra fissa operatore: Interventi, Agenda, Mappa, Messaggi, Profilo.
- Sezioni separate con navigazione persistente.
- Intervento/timer restano attivi durante la navigazione.
- Ritorno rapido all'intervento in corso.
- Agenda giornaliera, mappa/percorso, messaggi ufficio e profilo operatore demo.

## Build 5.0.12
- Selezione libera dell'intervento, indipendente da urgenza/orario.
- Scheda intervento operativa nello stile della seconda immagine.
- Firme operatore/cliente corrette con pad firma dedicato full-screen/modal.
- Chiusura intervento reale: valida le firme, arresta timer, chiude scheda e genera rapportino.
- Rapportino ridisegnato compatto A4: cliente, intervento, posizione/mappa, attività, richiesta, anomalie, relazione, 4 foto, firme, QR e invio.

## Build 5.0.12
- Mappe reali OpenStreetMap/Leaflet nella dashboard ufficio, Control Room, area Mappa operatore e scheda intervento.
- Marker reali per gli interventi demo e navigazione esterna Google Maps.
- Mappa reale anche nel rapportino.
- Rapportino reimpaginato sulla struttura della foto di riferimento: testata/logo/QR, dati cliente e intervento, posizione+mappa, attività, anomalie, richiesta cliente, relazione, 4 foto, firme e blocco invio.
- Ottimizzazione stampa A4 su una pagina.

## Build 5.0.12
- Mappe responsive ottimizzate su smartphone, tablet e desktop.
- Fit automatico dei marker e comandi Mostra tutti / Centra intervento.
- Correzione resize Leaflet quando si cambia sezione.
- Interventi apribili direttamente dall'Agenda.
- Scelta intervento sempre libera.
- Sezione Interventi terminati.
- Possibilità di riaprire un intervento terminato, modificarlo e rigenerare il rapportino.
- Il nuovo rapportino sostituisce/aggiorna la versione operativa dell'intervento demo.

## Build 5.0.12
- Rimosso dal PDF/stampa tutto il blocco Invio rapportino.
- Le azioni PDF/Email/WhatsApp/Condividi restano disponibili solo nell'interfaccia app.
- Mappa rapportino ricreata e centrata prima della stampa.
- Zoom fisso e invalidateSize per evitare riquadri mappa vuoti o tagliati.

## Build 5.0.12
- Eliminata la logica delle coordinate demo come posizione autorevole.
- Geocodifica reale dell'indirizzo tramite OpenStreetMap Nominatim.
- Lo stesso indirizzo/coordinate alimenta scheda intervento, mappe, Control Room e rapportino.
- Pulsante Localizza indirizzo.
- Possibilità di usare la posizione GPS dello smartphone come punto operativo.
- Possibilità di correggere manualmente il punto operativo toccando la mappa.
- Navigazione usa il punto operativo, se presente; altrimenti usa le coordinate dell'indirizzo.
- Il rapportino distingue coordinate dell'indirizzo e punto operativo corretto.

## Build 5.0.12
- Ufficio crea operatori con username/password dedicati.
- Modifica, cambio password, attiva/disattiva, elimina operatore.
- Assegna mezzo e ruolo.
- Crea, modifica ed elimina squadre.
- Assegna uno o più operatori alle squadre.
- Gli operatori creati dall'Ufficio possono accedere subito con le proprie credenziali nella demo locale.
