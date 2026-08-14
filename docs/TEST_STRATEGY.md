# Test strategy

- **Unit:** EventBus subscriber isolation, ErrorBoundary sync/async behavior, and abort lifecycle.
- **Contracts:** static import and forbidden-global rules enforce the dependency matrix and scan for legacy identifiers.
- **Integration:** router mount/unmount ordering, failure isolation, and feature contracts.
- **Isolation:** no production Firebase endpoints or likely credentials.
- **E2E:** browser coverage begins with operational features; alpha.2 provides only a shell.

Every architecture rule should fail fast in CI and accompany any future exception with an architecture decision record.
