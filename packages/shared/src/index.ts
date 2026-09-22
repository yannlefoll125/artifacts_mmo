// Public contract between the server and its clients: TypeBox schemas
// (the single source of truth), their Static<>-derived types, and (as
// they appear) route path constants. Cross-cutting pieces are re-exported
// here; DTO modules are importable directly as @artifacts/shared/dto/<name>.
// Importable by any TS client; only dependency is typebox.

export { defineDto } from './dto/define';
export { ProblemSchema, ProblemRef, PROBLEM_CONTENT_TYPE } from './problem';
export type { Problem } from './problem';
export { HealthStatusSchema, HealthStatusRef } from './dto/health';
export type { HealthStatus } from './dto/health';
