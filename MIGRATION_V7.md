# Spurgo Flow 7 migration plan

## v7.0.0-alpha.5 · People Module

Operatori and Squadre are autonomous entities behind `OperatorsRepository` and `TeamsRepository`.
Account provisioning is delegated to `AuthService`; profile updates and active-status changes never
invoke authentication. Availability has its own `AvailabilityService` contract. The feature emits
small EventBus notifications and contains repository failures within its own route boundary. Legacy
records and the Firebase schema are preserved without data migration; destructive operator deletion
is intentionally unavailable in alpha.5 in favour of reversible deactivation.

## v7.0.0-alpha.4 · Fleet Module

Mezzi is now an autonomous v7 feature. It preserves the v6.1.21 list, create, edit and conditional
delete workflows and the existing name, code, type, plate, capacity, status, hours/km and maintenance
fields. All persistence passes through `VehiclesRepository` and the legacy adapter without changing
stored records. The feature emits `vehicle:created`, `vehicle:updated` and `vehicle:deleted` payloads
containing only `{ id }`; Dashboard chooses independently whether to refresh.

## v7.0.0-alpha.3 · Clients Module

Clienti is now an autonomous feature mounted by the v7 router and protected by `FeatureBoundary`.
Its list, search, create, edit and delete workflows use only `ClientsRepository`; the repository's
legacy adapter preserves the `sf_v6_clients` records and Firebase collection without schema changes.
The feature emits `client:created`, `client:updated` and `client:deleted` with `{ id }` payloads.

## v7.0.0-alpha.2 · Dashboard Module

The Dashboard is the first migrated v7 feature. It implements the v7 lifecycle contract in
`src/features/dashboard`, builds a pure ViewModel from read-only repository DTOs, renders only
inside its route container, and refreshes through domain EventBus subscriptions. The v7 router
mounts it through `FeatureBoundary`; all other routes remain on the v6.1.21-R1 implementation.

The compatibility path is deliberately one-way: Dashboard → repositories → `LegacyAdapter` →
v6 state. No Firebase or legacy global is visible to the Dashboard module. This release changes
neither the Firebase schema nor any write workflow.

Migrate and test exactly one independently deployable module at a time while the v6.1.21-R1 application remains available. For every step: define/validate shared contracts, implement repositories, mount behind `FeatureBoundary`, test isolation and parity, then remove only that module's legacy-global access.

1. Dashboard
2. Clienti
3. Mezzi
4. Operatori/Squadre
5. Interventi
6. Agenda
7. Control Room
8. Messaggi
9. Rapportini
10. Operatore
11. Statistiche

A step is complete only after its contract, unit, architectural, integration, error-isolation, and v6 regression tests pass. No module may import another feature or Firebase directly. Maps and planning are optional services: failure must degrade only the dependent enhancement, never manual intervention workflows.
