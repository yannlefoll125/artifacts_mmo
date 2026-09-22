import {Type, type FastifyPluginAsyncTypebox} from '@fastify/type-provider-typebox'
import {type CraftSkill, getAllItemsItemsGet} from "@generated/artifactsmmo";
import {CraftSkillSchema} from "@/schema/schema";
import {CRAFT_SKILL} from "@/constants";

export const itemsRoutes: FastifyPluginAsyncTypebox = async (fastify) => {
    fastify.get('/', {
        schema: {
            querystring: Type.Object({
                skill: Type.Optional(CraftSkillSchema),
                level: Type.Optional(Type.Number()),
            })
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
            return {ok: true, data: data.filter(item => !level || item.level <= level)}

        }

        reply.statusCode = 500
        return {ok: false}


    })
}
