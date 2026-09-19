import createClient from 'openapi-fetch';
import type { paths } from '@generated/artifactsmmo';
import { config } from '@/config';

// Typed client for the ArtifactsMMO API. Regenerate types with `yarn generate`.
export const api = createClient<paths>({
  baseUrl: 'https://api.artifactsmmo.com',
  headers: {
    Authorization: `Bearer ${config.artifactsToken}`,
  },
});
