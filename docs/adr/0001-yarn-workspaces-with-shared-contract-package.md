# ADR-0001: Yarn workspaces monorepo with a shared contract package

Date: 2026-09-19
Status: accepted

## Context

The project is a thin Node/TypeScript server over the ArtifactsMMO HTTP API, played by hand
(no AI assist). Multiple clients are expected — a webapp first, possibly others — and they
need to share request/response shapes with the server without duplicating them. The
question was how clients and server share that contract ("middleware layer" in early
discussion; properly: a shared contract package).

Options considered:

- **Shared TypeScript types package** — plain DTOs/POJOs + envelope types, no runtime code.
- **Zod schemas in shared** — runtime validation both ends, types inferred.
- **tRPC** — end-to-end typed RPC; ties every client to TypeScript, replaces REST.
- **Server-published OpenAPI** — clients codegen against the server's own spec; most
  decoupled, most ceremony.

## Decision

Yarn (classic) workspaces monorepo:

- `packages/shared` (`@artifacts/shared`) — the contract: dependency-free plain TS DTOs and
  the `ApiResult<T>` envelope. Imported as TS source directly (`exports` → `./src/index.ts`),
  so there is no build step.
- `packages/server` (`@artifacts/server`) — Fastify app wrapping the game API via a typed
  `openapi-fetch` client. Generated game-API types (`generated-src/`) and the game token
  stay inside this package; clients only ever see `@artifacts/shared`.
- Future clients are sibling workspaces under `packages/`.

Everything runs through tsx (dev and start); `tsc --noEmit` is typecheck-only.

## Consequences

- Any TS client gets typed access to the server API by importing `@artifacts/shared`;
  non-TS clients are still possible since the wire format is plain REST + JSON.
- No runtime validation at the boundary (types only). If that's ever needed, revisit the
  Zod option — schemas could move into `shared` without changing the architecture.
- No build/dist pipeline exists; anything that later needs compiled output (e.g. deploying
  without tsx) must add one.
- Game-API types are regenerated from the live spec (`yarn generate`) and must never be
  hand-edited or leaked into the client contract.
