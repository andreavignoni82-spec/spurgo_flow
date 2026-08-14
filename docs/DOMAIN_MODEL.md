# Domain model — v8.0.0-alpha.2.1

All records are plain serializable objects. IDs are non-empty strings and immutable; array indexes are never identities. Dates use `YYYY-MM-DD`, times `HH:MM`, and timestamps ISO 8601 UTC. Optional fields are marked `?`. Every model exposes normalization, validation and safe cloning.

| Entity | Identity | Required fields | Optional fields / relations |
|---|---|---|---|
| Client | `id` | `name`, `active`, `createdAt`, `updatedAt` | `fiscalName?`, `phone?`, `email?`, `address?`, `city?`, `notes?` |
| Operator | `id` | `username`, `name`, `active`, timestamps | `surname?`, `phone?`, `role?`, `vehicleId?`, `cloudUid?`, `cloudEmail?`; password is forbidden |
| Team | `id` | `name`, `operatorIds[]`, `active`, timestamps | `operatorIds` contains references only |
| Vehicle | `id` | `plate`, `active`, timestamps | `name?`, `type?`, `notes?` |
| Intervention | immutable `id` | `clientId`, `address`, `date`, `startTime`, `estimatedMinutes`, `type`, `priority`, `status`, assignment arrays, timestamps | `clientSnapshot?`, `city?`, `coordinates?`, description/notes, operator/team/vehicle references, actual timestamps |
| Report | `interventionId` | `activities[]`, `anomalies[]`, `materials[]`, `photos[]` | relation, quantities, notes, signatures, signer, timestamps |
| Message | `id` | sender/recipient IDs and types, `text`, `createdAt` | `readAt?` |

**Report is a separate aggregate** with immutable identity `Report.interventionId`. The relationship is `Intervention 1 — 0..1 Report`; `ReportsRepository` is the only canonical persistent store. An Intervention never contains `relation`, `signatures`, `photos`, `materials`, or `reportData`. A Report is optional and `getByInterventionId()` returns `null` until one is saved.

Intervention status is exactly `PROGRAMMATO`, `IN_CORSO`, `TERMINATO`, `ANNULLATO`, or `RIAPERTO`; priority is `NORMALE` or `URGENTE`. A signature stores only `{ dataUrl, signedAt, signerType }`, where type is `operator` or `customer`—never a DOM canvas. A photo stores `{ id, data?, url?, mimeType?, name?, createdAt? }`; alpha.2 has no cloud storage.

Repository patches recursively merge plain objects. Arrays are **explicit replacements**, never automatic concatenations. Domain-specific append operations (for example `attachPhoto`) construct the intended replacement explicitly.


## Intervention transitions and creation

| From | Allowed destinations |
|---|---|
| `PROGRAMMATO` | `IN_CORSO`, `ANNULLATO` |
| `IN_CORSO` | `TERMINATO`, `ANNULLATO` |
| `TERMINATO` | `RIAPERTO` |
| `RIAPERTO` | `IN_CORSO`, `TERMINATO`, `ANNULLATO` |
| `ANNULLATO` | none |

Direct `PROGRAMMATO → TERMINATO` is rejected. Start assigns `actualStart` only when absent, completion assigns `actualEnd`, and reopening clears `actualEnd`; a reopened start preserves the original start. Normal creation accepts only the documented descriptive/planning whitelist. It rejects caller-provided identity, status, actual times, timestamps, and operator/team/vehicle assignment fields before persistence. Assignments require dedicated service commands.

## Beta.1 invariants

Operator non contiene password e lo username è lowercase/trimmed. Team contiene `operatorIds[]`. Intervention usa soltanto gli stati PROGRAMMATO, IN_CORSO, TERMINATO, ANNULLATO, RIAPERTO e priorità NORMALE/URGENTE. Report è un aggregate separato.
