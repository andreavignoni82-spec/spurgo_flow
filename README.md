# Spurgo Flow 8

Release **v8.0.0-alpha.5** introduces **Mezzi & Flotta**, the second operational feature. It provides local search, create/edit, activation management, duplicate-plate protection and abstract realtime updates through `VehiclesService`. **Clienti & Impianti** remains operational.

The runtime remains on the **MEMORY** data driver by default. The same repository contract supports the Firebase test emulator, while optional realtime updates remain behind the abstract adapter.

```sh
npm test
npm start
```

Clienti & Impianti and Mezzi & Flotta are operational. All other business modules intentionally remain placeholders; production Firebase remains disabled.

## v8.0.0-beta.1 — Complete operational suite

La beta.1 aggiunge People/Teams, Interventi, Agenda, Control Room, Messaggi, Rapportini separati, Dashboard e Statistiche derivate, oltre alla vista operatore smartphone-first. L'architettura resta Feature → Service → Repository contract → Adapter. Avvio: `npm start`; test: `npm test`; smoke browser: `npm run test:smoke`.
