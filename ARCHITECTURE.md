# Spurgo Flow 7 architecture

**Build:** `v7.0.0-alpha.2 · DASHBOARD MODULE`

This alpha adds an architecture alongside the recoverable v6.1.21-R1 application. It does not migrate pages, alter production behavior, or change Firebase configuration and schemas.

## Dependency direction

```text
features -> core, services, shared
services -> shared (and injected platform adapters)
core     -> shared contracts only
shared   -> no application layer
```

A feature **may** import `core`, `services`, and `shared`. A feature **must not** import another feature. Thus `features/agenda -> features/control-room` and `features/operator -> features/reports` are forbidden. Features communicate only through repository contracts, services, the Event Bus, and shared data contracts. Repository modules never depend on UI. Services never manipulate the DOM.

Firebase access is confined to `src/services/firebase`. Legacy v6 globals are confined to `src/services/legacy-adapter.js`; this temporary compatibility seam lets repository implementations be introduced without exposing globals to features.

## Runtime contracts

Every feature implements `{ id, mount(container, context), unmount(), refresh?(payload) }`. The router maps a route to that object and has no feature-specific logic. `FeatureBoundary.run(name, callback, container)` catches a module failure, logs it, and renders `Modulo temporaneamente non disponibile` only in that feature's container.

The Event Bus is the cross-module notification mechanism. Subscriber failures are collected and cannot prevent remaining subscribers from running. Domain event names are declared centrally in `src/core/event-bus.js`.

`AppState` provides a small observable immutable snapshot. It is not a replacement for repositories and must not become a feature-to-feature backdoor.

## Enforcement

Tests scan imports and service source, then exercise Event Bus, boundary, router, and failure isolation. These constraints apply to all future migrations. Changes to Firebase configuration, Firestore rules/schema, authentication setup, or cloud data are outside this release.
