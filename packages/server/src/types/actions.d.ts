import type {Cooldown} from "@/types/types";

export type ActionResult = {
    cooldown?: Cooldown;
}

export type MoveResult = ActionResult & {
    moved: boolean;
}
