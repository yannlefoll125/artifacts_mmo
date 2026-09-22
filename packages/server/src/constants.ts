import type {CraftSkill} from "@generated/artifactsmmo";

export type CraftSkillKey =
"WEAPON_CRAFTING" |
"GEAR_CRAFTING" |
"JEWELRY_CRAFTING" |
"COOKING" |
"WOODCUTTING" |
"MINING" |
"ALCHEMY"

export const CRAFT_SKILL: Record<CraftSkillKey, CraftSkill> = {
    WEAPON_CRAFTING: 'weaponcrafting',
    GEAR_CRAFTING: 'gearcrafting',
    JEWELRY_CRAFTING: 'jewelrycrafting',
    COOKING: 'cooking',
    WOODCUTTING: 'woodcutting',
    MINING: 'mining',
    ALCHEMY: 'alchemy'
}
