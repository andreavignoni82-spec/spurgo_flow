# Test strategy

- **Unit:** EventBus subscriber isolation, ErrorBoundary sync/async behavior, and abort lifecycle.
- **Contracts:** static import and forbidden-global rules enforce the dependency matrix and scan for legacy identifiers.
- **Integration:** router mount/unmount ordering, failure isolation, and feature contracts.
- **Isolation:** no production Firebase endpoints or likely credentials.
- **E2E:** browser coverage begins with operational features; alpha.2 provides only a shell.

Every architecture rule should fail fast in CI and accompany any future exception with an architecture decision record.

## Beta.1 coverage

I test verificano servizi People/Teams/Messages, selector Agenda/Dashboard/Statistics, conflitti deterministici, accesso diretto e via team, repository memory/Firebase contract e isolation. Lo smoke attraversa tutte le route operative e controlla PWA/cache e schermate non vuote.
