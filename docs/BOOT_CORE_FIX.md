# v8.0.0-beta.1.1 boot core fix

## Root cause reproduced

The unbundled browser entry graph loaded `src/app/bootstrap.js`, which statically
loaded `src/infrastructure/firebase/firebase-client.js` even when the selected
driver was `memory`. The first line of that adapter uses the bare package
specifier `firebase/app`. Native Safari/Chromium module loading has no npm
package resolver or import map, so graph construction failed with `TypeError:
Failed to resolve module specifier "firebase/app"`. No application code ran.
The generic pre-bootstrap listener in `index.html` therefore rendered
“Configurazione non valida”, hiding the module-loader exception.

The effective stack/import chain was:

1. `index.html` → `src/app/main.js`
2. `src/app/main.js` → `src/app/bootstrap.js`
3. `src/app/bootstrap.js` → `src/infrastructure/firebase/firebase-client.js`
4. browser module resolver → unresolved `firebase/app`

Alpha.5 and beta.1 shared that eager bootstrap import boundary, which is why
both releases failed before any Fleet-specific or route-specific code ran.

## Resolution and cache strategy

Bootstrap now selects and validates the driver before dynamically importing any
Firebase boundary. Memory composition uses local auth and no-op realtime ports,
does not inspect Firebase configuration, and performs no network operation.
Firebase validation and its project allow-list remain active only for the
Firebase driver.

The service worker uses a release-specific cache and network-first runtime
caching. Activation deletes every older `spurgoflow-v8*` cache. This prevents an
old HTML entry point from being retained with new modules, while the successful
same-origin module graph is cached for subsequent offline use. Version metadata
in the package, HTML fallback, application constants, manifest, and service
worker is consistently `v8.0.0-beta.1.1`.
