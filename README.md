# Spurgo Flow 8

Release **v8.0.0-alpha.5** introduces **Mezzi & Flotta**, the second operational feature. It provides local search, create/edit, activation management, duplicate-plate protection and abstract realtime updates through `VehiclesService`. **Clienti & Impianti** remains operational.

The runtime remains on the **MEMORY** data driver by default. The same repository contract supports the Firebase test emulator, while optional realtime updates remain behind the abstract adapter.

```sh
npm test
npm start
```

Clienti & Impianti and Mezzi & Flotta are operational. All other business modules intentionally remain placeholders; production Firebase remains disabled.
