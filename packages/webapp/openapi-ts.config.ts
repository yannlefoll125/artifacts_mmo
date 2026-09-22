import { defineConfig } from '@hey-api/openapi-ts'

// Generates the typed client for our own Fastify server from the spec the
// server emits (`yarn api:spec` there). Runs offline; output is
// deterministic for a given spec + pinned generator version. Never hand-edit
// generated-src/.
export default defineConfig({
  input: '../shared/spec/openapi.yaml',
  output: './generated-src/api',
  plugins: ['@hey-api/client-fetch'],
})
