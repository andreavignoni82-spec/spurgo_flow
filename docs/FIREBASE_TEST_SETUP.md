# Firebase test/emulator setup

Alpha.3 supports **only** Firebase Auth and Cloud Firestore emulators. It must never be pointed at production.

1. Install Node 20+ and the Firebase CLI: `npm install --global firebase-tools`.
2. Copy `.firebaserc.example` to `.firebaserc`. Keep the demo project ID; do not add production projects or credentials.
3. Start Auth and Firestore: `firebase emulators:start --only auth,firestore`.
4. Before loading the app, provide development-only runtime configuration:

   ```js
   globalThis.__SPURGO_FLOW_ENV__ = {
     driver: 'firebase-emulator',
     firebase: { host: '127.0.0.1', firestorePort: 8080, authPort: 9099,
       projectId: 'spurgoflow-v8-alpha3-test', apiKey: 'demo-test-only', useEmulator: true }
   };
   ```

5. Run `npm test`, then `npm run test:firebase` while the emulators are running. Run `npm run test:smoke` for the browser shell.

The default driver is `memory`. There is no silent fallback: `fallbackToMemory: true` must be explicit and produces a warning. `useEmulator: false` always fails with `Firebase production is disabled in v8 alpha.3`.

## Realtime versus EventBus

Firestore realtime subscriptions report read-only remote/storage snapshots. The EventBus reports local application/domain events. Snapshot callbacks never issue writes or emit success events, preventing snapshot → EventBus → write loops. Every realtime subscription returns an idempotent unsubscribe function; resubscribing with the same subscription identity replaces the prior listener.

## Security rules status

`firestore.rules` is intentionally emulator-only and requires an authenticated test user for the seven approved collections. Production deployment is prohibited. Automated rules-unit testing remains a **blocking TODO before production**; alpha.3 integration tests require a reachable local emulator and must otherwise be reported as not executed.
