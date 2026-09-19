import Fastify, {LogController} from 'fastify';
import type {ApiResult, HealthStatus} from '@artifacts/shared';
import {
    getActiveCharactersCharactersActiveGet, getMapByPositionMapsLayerXYGet,
    getMyCharactersMyCharactersGet,
    getServerDetailsGet, type MyCharactersListSchema
} from '@/api/client';
import {MyCharacters} from "@/adapters/myCharacters";
import {STATUS_CODES} from 'node:http';
import {httpMessage, logger, payloadPreview} from '@/util/logger';

export function buildServer() {
    const server = Fastify({
        loggerInstance: logger,
        // Default request logging is two JSON-heavy lines per request;
        // the onResponse hook below emits a single readable one instead.
        logController: new LogController({disableRequestLogging: true}),
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

        // console.log("map", map.data)

        return {
            ok: true, data: {
                name: kat.name(),
                position: kat.position(),
                cooldown: kat.cooldown(),
            }
        }
    })

    return server;
}
