# Data flow and environments

`Feature → Domain Service → Repository Contract → Infrastructure Adapter`

Features remain placeholders. They do not import Firebase. Services own semantic operations and protected-field rules; repositories only persist and query. Infrastructure selects a memory adapter by default. Firebase is opt-in, test/emulator-only, requires an injected client, and produces a clear configuration error (or an explicit controlled memory fallback).

After a successful repository write, the repository emits through `EventBus`: `Repository write → event envelope { entityId, source, timestamp, changes? }`. A failed validation or persistence write emits no success event. Status envelopes additionally contain `previousStatus` and `status`. Subscriber failures are isolated by the bus.

Environments: **development** defaults to memory; **test** uses memory or explicitly injected Firebase emulator adapters; **production** remains memory in alpha.2.1 and has no Firebase credentials or production connection.


Interventions and Reports have independent repositories and are joined only by `interventionId`. Creating or deleting an Intervention has no implicit Report side effect: cascade deletion is deliberately deferred until an application policy is defined. The future Firebase adapter must match memory patches: recursive merge for plain nested objects, explicit array replacement, and immutable identity. Alpha.2.1 adds only this adapter contract—no production Firebase implementation or connection.

## Beta.1

InterventionsRepository → InterventionsService → Agenda / Dashboard / Control Room / Statistics / Operator App. ReportsRepository resta l'unico store di `reports/{interventionId}`. People e assegnazioni scambiano esclusivamente ID stabili.
