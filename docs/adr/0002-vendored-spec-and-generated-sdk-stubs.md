# ADR-0002: Vendored OpenAPI spec + generated SDK stubs for the game API

Date: 2026-09-19
Status: accepted (amends the game-API client detail of ADR-0001)

## Context

ADR-0001 wrapped the game API with `openapi-fetch` over types generated straight from
the live spec URL. Two problems: SDK generation was non-deterministic (the upstream
spec can change between runs, silently shifting types), and call sites were
path-strings (`api.GET('/my/bank')`) rather than named, discoverable functions.

## Decision

- The OpenAPI spec is **vendored** at `packages/server/spec/openapi.json` and committed.
  `yarn mmo:spec` is the only step that touches the network; refreshing the spec is an
  explicit, reviewable diff.
- `yarn mmo:sdk` runs `@hey-api/openapi-ts` (version pinned exactly) offline from the
  vendored spec into `packages/server/generated-src/artifactsmmo/` — one named stub per
  operation plus all types and a bundled fetch client (no runtime dependency). Output is
  byte-for-byte reproducible for a given spec + generator version, and is committed.
- `src/api/client.ts` only injects `baseUrl` + bearer token and re-exports the stubs;
  app code imports stubs from there (never from `@generated` directly, which would skip
  the auth config).

`openapi-fetch` and `openapi-typescript` are removed. Everything else in ADR-0001 stands:
generated code stays inside the server and must never be hand-edited or leaked into
`@artifacts/shared`.

## Consequences

- Stub names come verbatim from the spec's FastAPI-style operationIds
  (e.g. `getBankDetailsMyBankGet`) — verbose, but deterministic and collision-free;
  we deliberately do no renaming layer.
- A game update now requires two committed steps: `yarn mmo:spec` then `yarn mmo:sdk`.
