# @artifacts/webapp

Vue 3 + Vite frontend for the artifacts_mmo server. Talks to the server
through a REST client generated from `packages/shared/spec/openapi.yaml`
(see the root README for the full contract pipeline).

All commands run from this directory with yarn:

```sh
yarn dev          # dev server; proxies /api to the local Fastify server
yarn build        # typecheck + production build
yarn test:unit    # Vitest component tests
yarn test:e2e     # Playwright e2e (stubbed /api; see playwright.config.ts)
yarn api:client   # regenerate the API client from the OpenAPI spec
yarn lint         # oxlint + eslint
```

Import generated API stubs from `@/api/client` (which configures the base
URL and re-exports them), never from `@generated/api` directly.
