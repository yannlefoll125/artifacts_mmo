import {Type, type Static} from 'typebox';
import {defineDto} from './dto/define';

/**
 * RFC 9457 Problem Details — the shape of every error response. Success
 * responses carry the bare payload; failures return this object with
 * content type `application/problem+json` (PROBLEM_CONTENT_TYPE).
 */
export const [ProblemSchema, ProblemRef] = defineDto('Problem', Type.Object({
    /** URI identifying the problem type; defaults to "about:blank" per the RFC. */
    type: Type.Optional(Type.String()),
    /** Short human-readable summary of the problem type. */
    title: Type.String(),
    /** HTTP status code, mirrored into the body per the RFC. */
    status: Type.Number(),
    /** Human-readable detail specific to this occurrence. */
    detail: Type.Optional(Type.String()),
    /** Extension member: upstream ArtifactsMMO status code, when the failure came from the game API. */
    upstreamCode: Type.Optional(Type.Number()),
}));

export type Problem = Static<typeof ProblemSchema>;

export const PROBLEM_CONTENT_TYPE = 'application/problem+json';
