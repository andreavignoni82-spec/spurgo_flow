# Domain model — v8.0.0-alpha.2

All records are plain serializable objects. IDs are non-empty strings and immutable; array indexes are never identities. Dates use `YYYY-MM-DD`, times `HH:MM`, and timestamps ISO 8601 UTC. Optional fields are marked `?`. Every model exposes normalization, validation and safe cloning.

| Entity | Identity | Required fields | Optional fields / relations |
|---|---|---|---|
| Client | `id` | `name`, `active`, `createdAt`, `updatedAt` | `fiscalName?`, `phone?`, `email?`, `address?`, `city?`, `notes?` |
| Operator | `id` | `username`, `name`, `active`, timestamps | `surname?`, `phone?`, `role?`, `vehicleId?`, `cloudUid?`, `cloudEmail?`; password is forbidden |
| Team | `id` | `name`, `operatorIds[]`, `active`, timestamps | `operatorIds` contains references only |
| Vehicle | `id` | `plate`, `active`, timestamps | `name?`, `type?`, `notes?` |
| Intervention | immutable `id` | `clientId`, `address`, `date`, `startTime`, `estimatedMinutes`, `type`, `priority`, `status`, assignment arrays, timestamps | `clientSnapshot?`, `city?`, `coordinates?`, description/notes, operator/team/vehicle references, actual timestamps, `reportData?` |
| Report | `interventionId` | `activities[]`, `anomalies[]`, `materials[]`, `photos[]` | relation, quantities, notes, signatures, signer, timestamps |
| Message | `id` | sender/recipient IDs and types, `text`, `createdAt` | `readAt?` |

Intervention status is exactly `PROGRAMMATO`, `IN_CORSO`, `TERMINATO`, `ANNULLATO`, or `RIAPERTO`; priority is `NORMALE` or `URGENTE`. A signature stores only `{ dataUrl, signedAt, signerType }`, where type is `operator` or `customer`—never a DOM canvas. A photo stores `{ id, data?, url?, mimeType?, name?, createdAt? }`; alpha.2 has no cloud storage.

Repository patches recursively merge plain objects. Arrays are **explicit replacements**, never automatic concatenations. Domain-specific append operations (for example `attachPhoto`) construct the intended replacement explicitly.
