import Fastify, {LogController, type FastifyInstance, type FastifyReply, type FastifyRequest} from 'fastify';
import {HealthStatusRef, HealthStatusSchema, PROBLEM_CONTENT_TYPE, ProblemRef, ProblemSchema, type HealthStatus} from '@artifacts/shared';
import {ItemSchema} from '@artifacts/shared/dto/items';
import {
    type CraftSchema, type CraftSkill,
    getActiveCharactersCharactersActiveGet, getAllItemsItemsGet, getMapByPositionMapsLayerXYGet,
    getMyCharactersMyCharactersGet,
    getServerDetailsGet, type MyCharactersListSchema
} from '@/api/client';
import {MyCharacters} from "@/adapters/myCharacters";
import {STATUS_CODES} from 'node:http';
import {httpMessage, logger, payloadPreview} from '@/util/logger';
import {isApiError} from "@/util/utils";
import {waitCooldown} from "@/util/cooldown";
import {CHICKEN} from "@/util/locations";
import {Type} from "typebox";
import type {FastifyPluginAsyncTypebox, TypeBoxTypeProvider} from "@fastify/type-provider-typebox";
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

// `configure` runs before any route is registered — plugins that need to
// observe route registration (e.g. @fastify/swagger in the spec-generation
// script) must be registered there, not after buildServer returns.
export function buildServer(configure?: (server: FastifyInstance) => void) {
    const server = Fastify({
        loggerInstance: logger,
        logController: new QuietRequestLogController(),
    }).withTypeProvider<TypeBoxTypeProvider>();

    // The pino loggerInstance specializes the instance's logger generic, which
    // FastifyInstance's default doesn't cover — safe to erase for callbacks
    // that only register plugins.
    configure?.(server as unknown as FastifyInstance);

    // Shared DTO schemas, registered by $id so route schemas can $ref them
    // and the emitted OpenAPI spec gets named components instead of inline
    // copies (which the generated webapp client turns into named types).
    server.addSchema(ItemSchema);
    server.addSchema(ProblemSchema);
    server.addSchema(HealthStatusSchema);

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
    // Routes live in plugins (deferred until ready) rather than directly on
    // the instance, so plugins registered via `configure` — @fastify/swagger
    // in the spec-generation script — see them being added.
    server.register(rootRoutes);

    return server;
}

const rootRoutes: FastifyPluginAsyncTypebox = async (server) => {
    server.get('/health', {
        schema: {response: {200: HealthStatusRef}},
    }, async (): Promise<HealthStatus> => ({status: 'ok'}));

    // Example of wrapping an ArtifactsMMO endpoint in the shared response
    // convention — bare payload on success, RFC 9457 problem+json on failure.
    // The pattern clients can rely on; replace/extend as you build.
    server.get('/server-status', {
        schema: {
            response: {
                200: Type.Unknown(),
                500: {content: {[PROBLEM_CONTENT_TYPE]: {schema: ProblemRef}}},
            },
        },
    }, async (request, reply) => {
        try {
            // throwOnError on the game-API client: failures land in the
            // catch, never as a data-less result.
            const {data} = await getServerDetailsGet();
            return data.data;
        } catch (e) {
            reply.statusCode = 500;
            reply.type(PROBLEM_CONTENT_TYPE);
            return {title: 'Upstream error', status: 500, upstreamCode: isApiError(e) ? e.error.code : undefined};
        }
    });

    server.get('/test', async (request) => {

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

    server.get('/fight-chicken', async () => {
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



    server.get('/error', async () => {
        throw new Error('test error')
    })
}
