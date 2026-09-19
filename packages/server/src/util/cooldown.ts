import type {Cooldown} from "@/types/types";
import {sleep} from "@/util/utils";
import {logger as lg} from "@/util/logger";

const logger = lg.child({scope: 'cooldown'})

const COOLDOWN_BUFFER = 100; //ms
export async function waitCooldown(cooldown: Cooldown): Promise<void> {
    if (!cooldown) {
        return;
    }
    logger.info("Waiting for cooldown (%s)s", cooldown.remaining_seconds)
    await sleep(cooldown.remaining_seconds * 1000 + COOLDOWN_BUFFER);

}

export function executeAtEndOfCooldown(cooldown: Cooldown, callback: () => void): void {
    setTimeout(callback, cooldown.remaining_seconds * 1000 + COOLDOWN_BUFFER);
}
