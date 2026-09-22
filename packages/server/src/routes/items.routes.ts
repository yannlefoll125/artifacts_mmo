import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox'
import {PROBLEM_CONTENT_TYPE, ProblemRef} from '@artifacts/shared';
import {type CraftSkill, getAllItemsItemsGet} from "@generated/artifactsmmo";
import {CraftSkillSchema} from "@/schema/schema";
import {CRAFT_SKILL} from "@/constants";
import {isApiError} from "@/util/utils";
import {ItemRef} from "@artifacts/shared/dto/items";

export const itemsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/', {
        schema: {
            querystring: Type.Object({
                skill: Type.Optional(CraftSkillSchema),
                level: Type.Optional(Type.Number()),
            }),
            response: {
                200: Type.Array(ItemRef),
                500: {content: {[PROBLEM_CONTENT_TYPE]: {schema: ProblemRef}}},
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
            return data.filter(item => !level || item.level <= level).map(item => ({
                name: item.name,
                level: item.level,
                description: item.description,
            }))
        } catch (e) {
            reply.statusCode = 500
            reply.type(PROBLEM_CONTENT_TYPE)
            return {title: 'Upstream error', status: 500, upstreamCode: isApiError(e) ? e.error.code : undefined}
        }
    })
}
