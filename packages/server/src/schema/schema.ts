import {Type} from "typebox";
import {CRAFT_SKILL} from "@/constants";


export const CraftSkillSchema
    = Type.Union(Object.values(CRAFT_SKILL).map(s => Type.Literal(s)));
