// Public contract between the server and its clients.
// Everything a client needs to talk to the server lives here: DTOs,
// response envelopes, and (as they appear) route path constants.
// Keep this package dependency-free so any TS client can import it.

export type { ApiResult, ApiError } from './envelope';
export type { HealthStatus } from './dto/health';
