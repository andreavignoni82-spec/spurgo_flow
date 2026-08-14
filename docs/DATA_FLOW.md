# Data flow and environments

`Feature → Domain Service → Repository Contract → Infrastructure Adapter`

Features remain placeholders. They do not import Firebase. Services own semantic operations and protected-field rules; repositories only persist and query. Infrastructure selects a memory adapter by default. Firebase is opt-in, test/emulator-only, requires an injected client, and produces a clear configuration error (or an explicit controlled memory fallback).

After a successful repository write, the repository emits through `EventBus`: `Repository write → event envelope { entityId, source, timestamp, changes? }`. A failed validation or persistence write emits no success event. Status envelopes additionally contain `previousStatus` and `status`. Subscriber failures are isolated by the bus.

Environments: **development** defaults to memory; **test** uses memory or explicitly injected Firebase emulator adapters; **production** remains memory in alpha.2 and has no Firebase credentials or production connection.
