# webapp-scaffold — decisions

Recorded 2026-09-22 via /one-by-one. Scope: scaffold the Vue 3 frontend and the
TypeBox → OpenAPI → generated-client pipeline.

1. **Scaffold**: `create-vue` with the full option set — Vue 3, TypeScript,
   Composition API, Vue Router, Pinia, Vitest (unit), ESLint/Prettier, Playwright.
2. **Package**: `packages/webapp`, package name `@artifacts/webapp`.
3. **Spec home**: the server's generated OpenAPI document lives in
   `packages/shared/spec/openapi.yaml`.
4. **Spec in git**: checked in (like the vendored upstream spec), regenerated on
   demand by a yarn script in the server package that registers
   `@fastify/swagger` over `buildServer()` and writes the yaml.
5. **Response schemas**: add TypeBox `response` schemas to existing routes
   (items, health) as part of this work. TypeBox becomes the single source of
   truth for the API envelope; the hand-written TS types in shared are replaced
   by `Static<>`-derived types. Note: this turns on Fastify response
   validation/fast-serialization (out-of-schema fields get stripped).
6. **Schema home**: the TypeBox envelope/DTO schemas live in `@artifacts/shared`,
   which gains `typebox` as its single runtime dependency (zero transitive deps,
   browser-safe). Update the package's "dependency-free" header comment to
   "importable by any TS client; only dependency is typebox".
7. **Client generation**: webapp mirrors the server's setup — pinned
   `@hey-api/openapi-ts@0.99.0` + `@hey-api/client-fetch`, config
   `openapi-ts.config.ts` reading `../shared/spec/openapi.yaml`, output to
   `packages/webapp/generated-src/api/`, exposed as a `generate` script, never
   hand-edited.
8. **Playwright scope**: E2E tests run the Vue app alone and stub `/api/*` with
   `page.route` fixtures — no game-API token or cooldowns in tests. In dev, Vite
   proxies `/api` to the local Fastify server. Real-stack smoke tests are a
   possible follow-up, not in scope.
