import { client } from '@generated/api/client.gen'

// All generated-client calls go through /api: the Vite dev server proxies it
// to the local Fastify server (see vite.config.ts), and Playwright e2e stubs
// it with page.route fixtures.
client.setConfig({ baseUrl: '/api' })
