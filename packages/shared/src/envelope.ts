import {Type, type Static, type TSchema} from 'typebox';

export const ApiErrorSchema = Type.Object({
    message: Type.String(),
    /** Upstream ArtifactsMMO error code, when the failure came from the game API. */
    upstreamCode: Type.Optional(Type.Number()),
});

export type ApiError = Static<typeof ApiErrorSchema>;

/**
 * Envelope schema for a route's response: pass the schema of the success
 * payload. Registering this as a Fastify response schema turns on response
 * validation/fast-serialization — fields outside the schema get stripped.
 */
export const ApiResultSchema = <T extends TSchema>(data: T) => Type.Union([
    Type.Object({ok: Type.Literal(true), data}),
    Type.Object({ok: Type.Literal(false), error: ApiErrorSchema}),
]);

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: ApiError };
