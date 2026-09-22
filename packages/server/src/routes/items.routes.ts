import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox'
import {PROBLEM_CONTENT_TYPE, ProblemSchema} from '@artifacts/shared';
import {type CraftSkill, getAllItemsItemsGet} from "@generated/artifactsmmo";
import {CraftSkillSchema} from "@/schema/schema";
import {CRAFT_SKILL} from "@/constants";
import {isApiError} from "@/util/utils";

export const itemsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/', {
        schema: {
            querystring: Type.Object({
                skill: Type.Optional(CraftSkillSchema),
                level: Type.Optional(Type.Number()),
            }),
            response: {
                // Items pass through from the game API unshaped for now, so
                // the payload schema stays Unknown.
                200: Type.Array(Type.Unknown()),
                500: {content: {[PROBLEM_CONTENT_TYPE]: {schema: ProblemSchema}}},
            },
        }
    }, async (request, reply) => {
        const {skill = CRAFT_SKILL.COOKING, level} = request.query

        try {
            // The client is configured with throwOnError — upstream failures
            // (HTTP or network) land in the catch, never as a data-less result.
            const result = await getAllItemsItemsGet({
                query: {
                    craft_skill: skill as CraftSkill
                }
            })
            const data = result.data.data;
            return data.filter(item => !level || item.level <= level)
        } catch (e) {
            reply.statusCode = 500
            reply.type(PROBLEM_CONTENT_TYPE)
            return {title: 'Upstream error', status: 500, upstreamCode: isApiError(e) ? e.error.code : undefined}
        }
    })
}
