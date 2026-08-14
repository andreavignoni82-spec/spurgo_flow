# Security

Alpha.2.1 connects to no production Firebase project and commits no real API key, endpoint, or secret. Memory is the default driver; Firebase is test/emulator-only and opt-in through injected configuration. Authentication is a separate future boundary. Passwords are never accepted or persisted in the Operator domain model.

All records are validated at repository boundaries, IDs are immutable, returned data is safely cloned, and service APIs protect status, assignment, vehicle and actual-time fields. Environment secrets must remain outside the repository. Firebase security rules and authentication must be completed and tested before any future production connection.
