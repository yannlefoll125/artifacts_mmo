# ADR-0003: TypeBox schemas in shared as the single source of truth for the server's API

Date: 2026-09-22
Status: accepted (amends the contract detail of ADR-0001; the envelope it mentions is superseded by ADR-0004 — read "envelope + DTOs" as "problem details + DTOs")

## Context

ADR-0001 made `@artifacts/shared` a dependency-free package of plain TS DTOs, with no
runtime validation at the boundary, and noted that schemas could move into shared if
validation was ever needed. Building the first client (the Vue webapp) forced the
question of how the webapp gets typed access to the server: import the shared types and
hand-write fetch calls, or generate a client from a server-published spec (the most
decoupled option ADR-0001 considered). Zod was the schema candidate back then; the
server has since adopted TypeBox for request validation (querystrings) because Fastify's
type provider consumes it natively.

## Decision

TypeBox is the single source of truth for the server's own API contract, feeding one
pipeline:

- `@artifacts/shared` holds the TypeBox schemas (envelope + DTOs); the TS types are
  `Static<>`-derived from them. The package gains exactly one runtime dependency,
  `typebox` (zero transitive deps, browser-safe) — "dependency-free" from ADR-0001 is
  relaxed to "importable by any TS client".
- Server routes declare those schemas as Fastify `response` schemas, which turns on
  response validation/fast-serialization: fields outside the schema are **stripped from
  responses**. Routes must live in plugins (not directly on the instance) so
  spec-generation can observe them.
- `yarn api:spec` registers `@fastify/swagger` over `buildServer()` and writes
  `packages/shared/spec/openapi.yaml`, committed like the vendored game spec.
- The webapp never imports `@artifacts/shared` types for API calls; it generates its
  client from that yaml with the same pinned `@hey-api/openapi-ts` setup the server
  uses for the game API (output `generated-src/`, committed, never hand-edited).

## Consequences

- One schema edit ripples through validation, serialization, the spec, and the webapp
  client — but only after re-running `yarn api:spec` then `yarn api:client`;
  forgetting either leaves the client stale. Both outputs are committed,
  so staleness shows up as a reviewable diff.
- Response stripping means an out-of-schema field silently disappears from responses —
  schema-first, not code-first, when adding fields.
- Non-TS clients get a real OpenAPI document instead of needing to read TS types.
- The webapp holds two generated artifacts total (its own API client) while the server
  holds the game-API client; neither crosses into `@artifacts/shared`, which stays the
  schema home only.
