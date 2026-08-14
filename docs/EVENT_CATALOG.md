# Event catalog

The authoritative constants live in `src/core/events.js`: create/update/delete events for clients, teams and vehicles; operator create/update/status; intervention create/update/delete/status/assignment/start/complete/reopen; report create/update/signature/photos; and message create/update/read/delete. Events are emitted only after a successful write.


Event ownership is intentional. Repositories emit CRUD persistence events (for example `intervention:updated`); domain services emit semantic events (for example `intervention:statusChanged` and `intervention:completed`). Completion produces the persistence event followed by at most one of each semantic event—never duplicate semantic notifications.

## Beta.1

La suite riusa gli eventi semantici già catalogati per operator, team, intervention, report e message. Gli eventi aggiornano read model e UI; EventBus non è storage.
