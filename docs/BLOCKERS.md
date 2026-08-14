# BLOCKER beta.1 — Auth role routing

## Causa

La baseline alpha.5 espone da Auth soltanto `{ uid, email }`: non esiste un ruolo attendibile `office | operator`, né una sessione Auth memory. Implementare routing e autorizzazione per ruolo senza cambiare questo contratto produrrebbe un controllo UI insicuro. La stop condition della master build vieta workaround quando è necessario cambiare Auth architecture.

## File coinvolti

- `src/services/auth/auth-service.js`
- `src/infrastructure/firebase/firebase-auth-adapter.js`
- `src/app/bootstrap.js`
- `src/app/router.js`
- `src/features/operator/index.js`

## Soluzione proposta

Estendere formalmente l'identity port con un ruolo derivato da claim/test identity autorizzata, aggiungere un adapter Auth memory, un route guard che rivalidi l'accesso prima del mount e testare logout/subscription. Non salvare il ruolo o password in modo non attendibile nel client.

## Impatto

La suite office in memory e i nuovi moduli/read model sono testabili, ma login role-based, enforcement dell'accesso Operator e quindi la Definition of Done completa non possono essere dichiarati completati in questa patch. Nessuna migrazione Firebase o workaround è stato introdotto.
