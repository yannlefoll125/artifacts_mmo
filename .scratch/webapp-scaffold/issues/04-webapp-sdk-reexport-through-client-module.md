# Webapp imports generated stubs directly, skipping the client config module

Status: done (fixed 2026-09-22)

Triage 2026-09-22: fix as described — `src/api/client.ts` re-exports the
generated SDK after `setConfig`, components import from `@/api/client`, the
side-effect import in `main.ts` is dropped.

From the 2026-09-22 code review (standards axis, finding 3).
`ServerHealth.vue` imports `getHealth` from `@generated/api` while the
`baseUrl: '/api'` config lives in `packages/webapp/src/api/client.ts`, applied
only via a side-effect import in `main.ts`. ADR-0002 establishes the pattern for
the server's analogous client: re-export stubs from the config module and never
import `@generated` directly. Mirror that: make `src/api/client.ts` re-export the
SDK and import from there.
