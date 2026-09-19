import Fastify from 'fastify';
import type { ApiResult, HealthStatus } from '@artifacts/shared';
import { api } from '@/api/client';

export function buildServer() {
    const server = Fastify({ logger: true });

    server.get('/health', async (): Promise<HealthStatus> => ({ status: 'ok' }));

    // Example of wrapping an ArtifactsMMO endpoint in the shared ApiResult
    // envelope — the pattern clients can rely on. Replace/extend as you build.
    server.get('/server-status', async (): Promise<ApiResult<unknown>> => {
        const { data, response } = await api.GET('/');
        if (!data) {
            return { ok: false, error: { message: 'upstream error', upstreamCode: response.status } };
        }
        return { ok: true, data: data.data };
    });

    return server;
}
