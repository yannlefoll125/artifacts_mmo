import { client } from '@generated/api/client.gen'

// Configures the generated server-API client and re-exports the typed
// per-operation stubs. Import stubs from this module, not from @generated
// directly — that would skip this configuration.
// All calls go through /api: the Vite dev server proxies it to the local
// Fastify server (see vite.config.ts), and Playwright e2e stubs it with
// page.route fixtures.
client.setConfig({ baseUrl: '/api' })

export * from '@generated/api'
