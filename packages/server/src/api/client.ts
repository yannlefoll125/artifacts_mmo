import { client } from '@generated/artifactsmmo/client.gen';
import { config } from '@/config';
import { logger, payloadPreview } from '@/util/logger';

// Configures the generated ArtifactsMMO client and re-exports the typed
// per-operation stubs. Import stubs from this module, not from @generated
// directly — that would skip this configuration.
// Regenerate stubs with `yarn generate` (see openapi-ts.config.ts); refresh
// the vendored spec with `yarn spec:fetch`.
client.setConfig({
    baseUrl: 'https://api.artifactsmmo.com',
    auth: () => config.artifactsToken,
});

// One log line per upstream call (URL + status + duration; never headers,
// so the token stays out of the logs).
const log = logger.child({ scope: 'artifacts' });
const startedAt = new WeakMap<Request, number>();

const pathOf = (request: Request) => {
    const url = new URL(request.url);
    return url.pathname + url.search;
};

client.interceptors.request.use(async (request) => {
    startedAt.set(request, performance.now());
    if (log.isLevelEnabled('debug')) {
        const body = request.body ? await request.clone().text() : '';
        log.debug(`→ ${request.method} ${pathOf(request)}${body ? ` ${payloadPreview(body)}` : ''}`);
    }
    return request;
});

client.interceptors.response.use(async (response, request) => {
    const start = startedAt.get(request);
    const duration = start != null ? ` ${Math.round(performance.now() - start)}ms` : '';
    const line = `${request.method} ${pathOf(request)} ${response.status}${duration}`;
    if (response.ok) {
        log.info(line);
    } else {
        log.warn(line);
    }
    if (log.isLevelEnabled('debug')) {
        const body = payloadPreview(await response.clone().text());
        if (body) {
            log.debug(`← ${request.method} ${pathOf(request)} ${body}`);
        }
    }
    return response;
});

client.interceptors.error.use((error, response, request) => {
    // HTTP errors already got a warn line from the response interceptor;
    // this only covers failures with no response at all (DNS, timeout, ...).
    if (!response && request) {
        log.error({ err: error }, `${request.method} ${pathOf(request)} failed`);
    }
    return error;
});

export * from '@generated/artifactsmmo';
