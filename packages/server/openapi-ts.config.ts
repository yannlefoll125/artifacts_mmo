import { defineConfig } from '@hey-api/openapi-ts';

// Generates the typed ArtifactsMMO client from the vendored spec (see
// scripts/fetch-spec.mjs). Runs offline; output is deterministic for a given
// spec + pinned generator version. Never hand-edit generated-src/.
export default defineConfig({
    input: './spec/openapi.json',
    output: './generated-src/artifactsmmo',
    plugins: [{ name: '@hey-api/client-fetch', throwOnError: true }],
});
