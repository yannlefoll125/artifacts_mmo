import { client } from '@generated/artifactsmmo/client.gen';
import { config } from '@/config';
import { httpMessage, logger, payloadPreview } from '@/util/logger';

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
const BODY_PREVIEW_MAX = 2000;

// Correlates the request/response wire dumps of one upstream exchange.
const exchangeIds = new WeakMap<Request, number>();
let exchangeSeq = 0;

const pathOf = (request: Request) => {
    const url = new URL(request.url);
    return url.pathname + url.search;
};

client.interceptors.request.use(async (request) => {
    startedAt.set(request, performance.now());
    if (log.isLevelEnabled('debug')) {
        const id = ++exchangeSeq;
        exchangeIds.set(request, id);
        const body = request.body ? await request.clone().text() : '';
        logger.debug(httpMessage(
            'Request',
            `api-${id}`,
            `${request.method} ${pathOf(request)}`,
            `${request.method} ${pathOf(request)} HTTP/1.1`,
            request.headers,
            payloadPreview(body, BODY_PREVIEW_MAX),
        ));
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
        const body = payloadPreview(await response.clone().text(), BODY_PREVIEW_MAX);
        logger.debug(httpMessage(
            'Response',
            `api-${exchangeIds.get(request) ?? '?'}`,
            `${request.method} ${pathOf(request)}`,
            `HTTP/1.1 ${response.status} ${response.statusText}`.trimEnd(),
            response.headers,
            body,
        ));
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
