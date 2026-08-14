# Firebase setup beta.1

La produzione non è configurata. Sono autorizzati esclusivamente progetto e porte dell'emulator definiti in `src/config/environment.js`. Avviare gli emulatori e impostare esplicitamente `driver: firebase-emulator`; il project guard viene eseguito prima dell'inizializzazione SDK. Non usare credenziali, service account o progetti storici.
