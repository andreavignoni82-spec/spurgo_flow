# Architecture

## Principles

Spurgo Flow 8 is a clean rebuild. The browser entry point creates an immutable **AppContext** containing service references, an EventBus, and a logger—not mutable business data.

### Feature isolation

A feature implements `{ id, mount(container, context), unmount() }`. On mount it receives both a lifecycle and its `AbortSignal`; on route transition the signal is aborted before unmount. Features may depend on app context types, core primitives, domain/services contracts, and shared code. They never import another feature, concrete infrastructure, or Firebase.

### Domain isolation

Domain modules hold entities and rules only. They do not know the DOM, features, browser APIs, Firebase, or concrete persistence. Alpha.1 intentionally provides only domain boundaries.

### Repository and service patterns

Repository contracts live at the service boundary and contain no DOM concepts. Infrastructure adapters may implement those contracts. Services orchestrate domain use cases without importing features or the DOM. Concrete adapters are injected through AppContext.

### Error isolation

ErrorBoundary contains synchronous throws and asynchronous rejections at feature lifecycle boundaries. One failed feature therefore cannot prevent navigation to another. EventBus similarly catches each subscriber independently, including rejected promises.

### Lifecycle

Each mount has a fresh lifecycle. Abort is the common cancellation mechanism for listeners, requests, timers, and other resources; unmount completes explicit teardown.

### EventBus

EventBus supports `on`, `off`, and `emit` for transient notifications. It is not a store and must not hold application state.

### Dependency matrix

| Layer | May import | Must not import |
|---|---|---|
| Features | app context, core, domain/services contracts, shared | features, Firebase, concrete infrastructure |
| Domain | domain, framework-free shared code | features, DOM/browser APIs, Firebase |
| Services | domain, contracts, framework-free shared code | features, DOM |
| Infrastructure | contracts, domain, platform SDKs | feature UI |
| App | all composition roots | business state globals |

There are no mutable `window` application globals, no feature-to-feature imports, and no Firebase imports in features.
