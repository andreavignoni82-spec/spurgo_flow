# Event catalog

The authoritative constants live in `src/core/events.js`: create/update/delete events for clients, teams and vehicles; operator create/update/status; intervention create/update/delete/status/assignment/start/complete/reopen; report create/update/signature/photos; and message create/update/read/delete. Events are emitted only after a successful write.
