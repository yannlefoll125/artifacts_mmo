// Public contract between the server and its clients.
// Everything a client needs to talk to the server lives here: TypeBox
// schemas (the single source of truth), their Static<>-derived types,
// and (as they appear) route path constants.
// Importable by any TS client; only dependency is typebox.

export { ProblemSchema, PROBLEM_CONTENT_TYPE } from './problem';
export type { Problem } from './problem';
export { HealthStatusSchema } from './dto/health';
export type { HealthStatus } from './dto/health';
