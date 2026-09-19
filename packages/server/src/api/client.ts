import { client } from '@generated/artifactsmmo/client.gen';
import { config } from '@/config';

// Configures the generated ArtifactsMMO client and re-exports the typed
// per-operation stubs. Import stubs from this module, not from @generated
// directly — that would skip this configuration.
// Regenerate stubs with `yarn generate` (see openapi-ts.config.ts); refresh
// the vendored spec with `yarn spec:fetch`.
client.setConfig({
    baseUrl: 'https://api.artifactsmmo.com',
    auth: () => config.artifactsToken,
});

export * from '@generated/artifactsmmo';
