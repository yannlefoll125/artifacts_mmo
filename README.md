# artifacts_mmo

A client/server setup for playing [ArtifactsMMO](https://www.artifactsmmo.com/) by hand.
The server is a thin TypeScript layer over the game API; clients (a webapp, or anything
else) talk to the server and share a contract package with it.

## Architecture

```
packages/
  shared/   @artifacts/shared  — the contract: DTOs (POJOs), ApiResult envelope,
                                 route types. Dependency-free; any TS client imports it.
  server/   @artifacts/server  — Fastify app wrapping the ArtifactsMMO API.
                                 Owns the game token; clients never see it.
  <web>/                       — future client workspace(s), added alongside.
```

Yarn workspaces link `@artifacts/shared` into consumers; it's imported as TS source
directly (no build step anywhere — everything runs through tsx/Vite-style tooling).

## Setup

```sh
yarn install
mkdir -p ~/.config/artifacts_mmo && echo '{ "artifactsToken": "..." }' > ~/.config/artifacts_mmo/config.json
# paste your token (https://artifactsmmo.com/account) into that file
yarn generate    # regenerate ArtifactsMMO types from the live spec
```

The API token is read from `~/.config/artifacts_mmo/config.json` (see `packages/server/src/config.ts`).
Other settings (e.g. `PORT`) come from the environment; an optional `packages/server/.env` is loaded if present.

## Scripts (run from the repo root)

| Script           | What it does                                                           |
| ---------------- | ---------------------------------------------------------------------- |
| `yarn dev`       | Run the server with watch/reload (tsx)                                 |
| `yarn start`     | Run the server once                                                    |
| `yarn generate`  | Regenerate `packages/server/generated-src/artifactsmmo.d.ts`           |
| `yarn typecheck` | `tsc --noEmit` in every workspace                                      |
| `yarn test`      | Run the server's Vitest suite                                          |

## Conventions

- **Contract first**: anything a client needs (request/response shapes, route paths)
  lives in `@artifacts/shared`, never duplicated in a client. Server routes return
  `ApiResult<T>` from the shared envelope.
- **`packages/server/src/api/client.ts`** — typed `openapi-fetch` client for the game
  API (auth header included). Call endpoints as `api.GET('/my/characters')` etc.
- **`generated-src/`** — generated game-API types. Never edit by hand; rerun
  `yarn generate` after game updates. These types stay inside the server — clients
  only ever see `@artifacts/shared`.
- Path aliases inside the server: `@/*` → `src/*`, `@generated/*` → `generated-src/*`
  (resolved by tsx at runtime, by Vitest via `vitest.config.ts`).

## Adding a client

1. Scaffold it under `packages/<name>` (e.g. Vite webapp) with `"@artifacts/shared": "*"`
   as a dependency and a tsconfig extending `../../tsconfig.base.json`.
2. `yarn install` to link workspaces.
3. Talk to the server over HTTP, typing responses with the shared DTOs
   (in dev, proxy `/api` to the server port, e.g. via Vite's `server.proxy`).
