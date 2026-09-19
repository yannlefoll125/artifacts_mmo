import Fastify, {LogController, type FastifyReply, type FastifyRequest} from 'fastify';
import type {ApiResult, HealthStatus} from '@artifacts/shared';
import {
    getActiveCharactersCharactersActiveGet, getMapByPositionMapsLayerXYGet,
    getMyCharactersMyCharactersGet,
    getServerDetailsGet, type MyCharactersListSchema
} from '@/api/client';
import {MyCharacters} from "@/adapters/myCharacters";
import {STATUS_CODES} from 'node:http';
import {httpMessage, logger, payloadPreview} from '@/util/logger';

// Default request logging is two JSON-heavy lines per request; the onResponse
// hook below emits a single readable one instead. disableRequestLogging would
// also silence error/404/stream logs, so only the noisy methods are muted.
class QuietRequestLogController extends LogController {
    override incomingRequest(): void {}

    override requestCompleted(error: Error | null | undefined, request: FastifyRequest, reply: FastifyReply): void {
        // Success line comes from the onResponse hook; response-stream errors
        // still deserve theirs.
        if (error) super.requestCompleted(error, request, reply);
    }

    override defaultErrorLog(error: Error, request: FastifyRequest, reply: FastifyReply): void {
        // The default line drags full req/res dumps along; the onResponse
        // line and debug wire dumps already cover those.
        if (reply.statusCode >= 500) {
            reply.log.error({err: error}, error.message);
        } else {
            reply.log.info({err: error}, error.message);
        }
    }
}

export function buildServer() {
    const server = Fastify({
        loggerInstance: logger,
        logController: new QuietRequestLogController(),
    });

    server.addHook('onResponse', async (request, reply) => {
        request.log.info(
            `${request.method} ${request.url} ${reply.statusCode} ${reply.elapsedTime.toFixed(0)}ms`,
        );
    });

    // Jetty-style wire dumps, opt-in via LOG_LEVEL=debug.
    const BODY_PREVIEW_MAX = 2000;
    server.addHook('preHandler', async (request) => {
        if (logger.isLevelEnabled('debug')) {
            logger.debug(httpMessage(
                'Request',
                String(request.id),
                `${request.method} ${request.url}`,
                `${request.method} ${request.url} HTTP/${request.raw.httpVersion}`,
                request.headers,
                request.body != null ? payloadPreview(request.body, BODY_PREVIEW_MAX) : '',
            ));
        }
    });
    server.addHook('onSend', async (request, reply, payload) => {
        if (logger.isLevelEnabled('debug')) {
            logger.debug(httpMessage(
                'Response',
                String(request.id),
                `${request.method} ${request.url}`,
                `HTTP/${request.raw.httpVersion} ${reply.statusCode} ${STATUS_CODES[reply.statusCode] ?? ''}`.trimEnd(),
                reply.getHeaders(),
                typeof payload === 'string' && payload ? payloadPreview(payload, BODY_PREVIEW_MAX) : '',
            ));
        }
        return payload;
    });

    server.get('/health', async (): Promise<HealthStatus> => ({status: 'ok'}));

    // Example of wrapping an ArtifactsMMO endpoint in the shared ApiResult
    // envelope — the pattern clients can rely on. Replace/extend as you build.
    server.get('/server-status', async (): Promise<ApiResult<unknown>> => {
        const {data, response} = await getServerDetailsGet();
        if (!data) {
            return {ok: false, error: {message: 'upstream error', upstreamCode: response?.status}};
        }
        return {ok: true, data: data.data};
    });

    server.get('/test', async (): Promise<ApiResult<unknown>> => {

        const characters = await MyCharacters.getCharacters();
        const kat = characters.find(c => c.name() === 'Kat');

        await kat.moveTo({x: 1, y: 1})

        const map = await getMapByPositionMapsLayerXYGet({
            path: {
                layer: "overworld",
                ...kat.position()
            }
        })


        return {
            ok: true, data: {
                name: kat.name(),
                position: kat.position(),
                cooldown: kat.cooldown(),
            }
        }
    })

    server.get('/error', async (): Promise<ApiResult<unknown>> => {
        throw new Error('test error')
    })

    return server;
}
