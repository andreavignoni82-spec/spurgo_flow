# Spurgo Flow 7 migration plan

## v7.0.0-alpha.10 · Reports Module

Rapportini preserves the real v6.1.21 `reportData` fields embedded in the intervention document and
normalizes them only inside the v7 domain. `ReportsRepository` is a non-destructive adapter over
`InterventionsRepository`; it never writes status or timing fields. Signatures, photos, preview/template,
print/export and native sharing are independent components. Preview, print and export use the same
persisted-data ViewModel and HTML. Report operations emit only `report:*` payloads with
`{ interventionId }`; failures in persistence, signature capture, export or sharing remain contained in
Reports. This remains the alpha.10 baseline; Statistiche remains intentionally unmigrated after alpha.11.

## v7.0.0-alpha.9 · Messages Module

Messaggi preserves the v6.1.21 office/operator DTO and is autonomous behind `MessagesRepository`.
Operator and team lookups pass only through their repositories; persistence, read updates and canonical
message identity pass only through `MessagesRepository`. Successful creates emit `message:created` after
persistence. Realtime notifications and the lifecycle-owned 30-second fallback refresh update only this
feature, and unmount clears every subscription and interval. The local form prevents duplicate sends and
retains its text on failure. No Firebase, legacy global or other feature dependency is present.

## v7.0.0-alpha.11 · Operator App

Operator App is an autonomous, smartphone-first orchestrator. It reads operator and team identity through
repositories, obtains canonical interventions through `InterventionsService`, and checks direct, multi-operator
and team assignment both in the personal agenda and again before opening. Reports, signatures and photos use
the shared report services and components. Saving a report never completes a job; completion awaits report
persistence before invoking `completeIntervention`, preserves a successfully saved report if completion fails,
and has a single-flight guard. Domain events refresh only Operator App, while AbortSignal/generation checks
prevent late UI work after unmount. It has no Firebase, office-feature, AgendaFeature or ReportsFeature dependency.

Dependency matrix: READS Operator/Teams/Interventions/Reports; WRITES InterventionsService/ReportsService;
AUTH AuthService; DIRECT FEATURE DEPENDENCIES none (only isolated signature/photo components).

## v7.0.0-alpha.8 · Control Room Module

Control Room is an autonomous monitoring and suggestion feature. It reads interventions through
`InterventionsService`, resources through their repositories, and delegates sequencing, travel, delay,
criticality and resource scoring to `PlanningService`. Confirmed operator/team assignments write only
through `InterventionsService`; post-persistence UI completion is emitted through EventBus. Planning and
MapsService failures degrade independently, and all subscriptions and refresh timers are owned by the
feature lifecycle. No Firebase, Leaflet, other feature, Agenda, or direct intervention repository dependency
is present. The planning algorithm itself is unchanged: `PlanningService` is a technical adapter over the
baseline engine.

## v7.0.0-alpha.7 · Agenda Module

Agenda is an autonomous read model using `InterventionsService`, `OperatorsRepository` and
`TeamsRepository`. Day and week rendering, deterministic resource colors and overlap lanes are
pure feature-local concerns. The module never writes intervention data: block selection emits
`intervention:openRequested` with the canonical id and the application shell owns compatibility
navigation. Its EventBus subscriptions refresh only Agenda and are fully removed on unmount.

## v7.0.0-alpha.6 · Interventions Domain

Intervention identity, status changes, assignments, non-destructive patches and post-persistence events are centralized in `InterventionsService`. The repository retains the v6.1.21 DTO shape and unknown fields (including complete `reportData`) without a Firebase schema change. Agenda, Control Room, Rapportini and App Operatore remain legacy consumers of the single `sf_v6_interventions`/Firebase source through the temporary compatibility seam.

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
