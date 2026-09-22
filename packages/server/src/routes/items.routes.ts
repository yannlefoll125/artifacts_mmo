import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox'
import {ApiResultSchema} from '@artifacts/shared';
import {type CraftSkill, getAllItemsItemsGet} from "@generated/artifactsmmo";
import {CraftSkillSchema} from "@/schema/schema";
import {CRAFT_SKILL} from "@/constants";

export const itemsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    // Items pass through from the game API unshaped for now, so the payload
    // schema stays Unknown — the envelope is the contract.
    const itemsResult = ApiResultSchema(Type.Array(Type.Unknown()));

    fastify.get('/', {
        schema: {
            querystring: Type.Object({
                skill: Type.Optional(CraftSkillSchema),
                level: Type.Optional(Type.Number()),
            }),
            response: {
                200: itemsResult,
                500: itemsResult,
            },
        }
    }, async (request, reply) => {
        const {skill = CRAFT_SKILL.COOKING, level} = request.query

        const result = await getAllItemsItemsGet({
            query: {
                craft_skill: skill as CraftSkill
            }
        })

        if (result.data) {
            const data = result.data.data;
            return {ok: true as const, data: data.filter(item => !level || item.level <= level)}

        }

        reply.statusCode = 500
        return {ok: false as const, error: {message: 'upstream error', upstreamCode: result.response?.status}}


    })
}
