import Fastify, {LogController, type FastifyReply, type FastifyRequest} from 'fastify';
import type {ApiResult, HealthStatus} from '@artifacts/shared';
import {
    type CraftSchema, type CraftSkill,
    getActiveCharactersCharactersActiveGet, getAllItemsItemsGet, getMapByPositionMapsLayerXYGet,
    getMyCharactersMyCharactersGet,
    getServerDetailsGet, type MyCharactersListSchema
} from '@/api/client';
import {MyCharacters} from "@/adapters/myCharacters";
import {STATUS_CODES} from 'node:http';
import {httpMessage, logger, payloadPreview} from '@/util/logger';
import {waitCooldown} from "@/util/cooldown";
import {CHICKEN} from "@/util/locations";
import {Type} from "typebox";
import type {TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
import {itemsRoutes} from "@/routes/items.routes";

// Default request logging is two JSON-heavy lines per request; the onResponse
// hook below emits a single readable one instead. disableRequestLogging would
// also silence error/404/stream logs, so only the noisy methods are muted.
class QuietRequestLogController extends LogController {
    override incomingRequest(): void {
    }

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
    }).withTypeProvider<TypeBoxTypeProvider>();

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
    server.register(itemsRoutes, {prefix: '/items'});

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

    server.get('/test', async (request): Promise<ApiResult<unknown>> => {

        const characters = await MyCharacters.getCharacters();
        const kat = characters.find(c => c.name() === 'Kat');

        const moveResult = await kat.moveTo({x: 1, y: 1})

        logger.debug("Move result: %o", moveResult)

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

    server.get('/fight-chicken', async (): Promise<ApiResult<unknown>> => {
        const characters = await MyCharacters.getCharacters();
        const kat = characters.find(c => c.name() === 'Kat');

        const lg = logger.child({scope: 'fight-chicken'});

        await kat.moveTo(CHICKEN)
        await kat.waitForCooldown()

        while (kat.level() < 5) {
            await kat.rest()
            await kat.waitForCooldown()

            while (true) {
                if (kat.hp() < 30 || kat.level() >= 5) {
                    break;
                }
                await kat.fight()
                await kat.waitForCooldown()

            }

            await kat.rest()
            await kat.waitForCooldown()

        }

        // await kat.gather()
        // await kat.waitForCooldown()

        return {ok: true, data: "ok"}
    })



    server.get('/error', async (): Promise<ApiResult<unknown>> => {
        throw new Error('test error')
    })

    return server;
}
