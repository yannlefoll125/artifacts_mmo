import type {Cooldown, Position} from "@/types/types";
import {
    actionFightMyNameActionFightPost, actionGatheringMyNameActionGatheringPost,
    actionMoveMyNameActionMovePost, actionRestMyNameActionRestPost,
    type CharacterSchema,
    type ErrorResponseSchema
} from "@generated/artifactsmmo";
import {logger} from "@/util/logger";
import {handleApiError} from "@/util/utils";
import type {ActionResult, MoveResult} from "@/types/actions";
import type {Logger} from "pino";
import {executeAtEndOfCooldown, waitCooldown} from "@/util/cooldown";

export class Character {

    private readonly _logger: Logger;
    private _characterSchema: CharacterSchema;
    private _cooldown: Cooldown;

    constructor(characterSchema: CharacterSchema) {
        this.update(characterSchema);
        this._logger = logger.child({scope: `Character:${this.name()}`})
    }

    private _setCooldown(cooldown: Cooldown): void {
        if (!cooldown || !cooldown.remaining_seconds) {
            this._cooldown = null;
            return;
        }
        this._cooldown = cooldown;
        executeAtEndOfCooldown(this._cooldown, () => this._setCooldown(null));
    }

    update(characterSchema: CharacterSchema, cooldown: Cooldown = null) {
        this._characterSchema = characterSchema;
        this._setCooldown(cooldown);
    }

    name(): string {
        return this._characterSchema.name;
    }

    position(): Position {
        return {x: this._characterSchema.x, y: this._characterSchema.y};
    }

    cooldown(): Cooldown {
        return this._cooldown;
    }

    hp(): number {
        return this._characterSchema.hp;
    }

    max_hp(): number {
        return this._characterSchema.max_hp;
    }

    level(): number {
        return this._characterSchema.level;
    }

    health(): string {
        return `${this.hp()} / ${this.max_hp()}`
    }

    async waitForCooldown() {
        await waitCooldown(this.cooldown())
    }

    async moveTo(position: Position): Promise<MoveResult> {
        this._logger.info("Moving to %j", position)

        let moveResult: MoveResult;
        try {
            const result = await actionMoveMyNameActionMovePost({
                body: position,
                path: {
                    name: this.name()
                }
            })

            const data = result.data.data;
            this._logger.info("Response data: %j", data)
            this.update(data.character, data.cooldown)

            moveResult = {
                cooldown: data.cooldown,
                moved: true,
            }

        } catch (error) {
            handleApiError(error,
                err => {
                    if (err.code !== 490) {
                        throw err;
                    }
                    moveResult = {
                        moved: true,
                    }
                })
        }


        return moveResult;

    }

    async fight(): Promise<ActionResult> {
        try {
            const result = await actionFightMyNameActionFightPost({
                path: {
                    name: this.name()
                }
            })

            const data = result.data.data;
            this.update(data.characters.find(c => c.name === this.name()), data.cooldown)
            return {
                cooldown: data.cooldown,
            }
        } catch (e) {
            handleApiError(e, null)
            return {};
        }

    }

    async rest(): Promise<ActionResult> {
        try {
            const result = await actionRestMyNameActionRestPost({
                path: {
                    name: this.name()
                }
            })

            const data = result.data.data;
            this.update(data.character, data.cooldown)
            return {
                cooldown: data.cooldown,
            }
        } catch (e) {
            handleApiError(e, null)
            return {};
        }

    }

    async gather(): Promise<ActionResult> {
        try {
            const result = await actionGatheringMyNameActionGatheringPost({
                path: {
                    name: this.name()
                }
            })

            const data = result.data.data;

            logger.info("Gather result: %j", data.details)

            this.update(data.character, data.cooldown)
            return {
                cooldown: data.cooldown,
            }
        } catch (e) {
            handleApiError(e, null)
            return {};
        }

    }

}
