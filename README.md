# Spurgo Flow 8

Release **v8.0.0-alpha.4** introduces **Clienti & Impianti**, the first operational feature. It provides client search, create/edit, details, and activation management through `ClientsService`; the existing address and city fields represent the main facility because the alpha.3 domain has no separate Plant/Site entity.

The runtime remains on the **MEMORY** data driver by default. The same repository contract supports the Firebase test emulator, while optional realtime updates remain behind the abstract adapter.

```sh
npm test
npm start
```

All other business modules intentionally remain placeholders; production Firebase remains disabled.
