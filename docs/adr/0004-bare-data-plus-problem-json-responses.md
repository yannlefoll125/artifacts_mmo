# ADR-0004: Bare payloads on success, RFC 9457 problem+json on failure

Date: 2026-09-22
Status: accepted (supersedes the `ApiResult<T>` envelope of ADR-0001/ADR-0003)

## Context

ADR-0001 gave the server a house envelope — `{ok: true, data} | {ok: false, error}`,
a Rust-`Result`-style discriminated union — and ADR-0003 made its TypeBox schema the
contract source of truth. The envelope duplicated what HTTP already encodes: the
status code and the `ok` flag both claimed to say whether the call succeeded, and the
route schemas let them disagree (a 500 could be declared as possibly `{ok: true}`,
which the generated webapp client then had to type as a possible success). Reviewing
that defect, the owner chose the standard shape over patching the house one.

## Decision

Success responses (2xx) return the bare payload with no wrapper. Error responses
return RFC 9457 Problem Details (`application/problem+json`): `ProblemSchema` in
`@artifacts/shared` (`title`, `status`, optional `type`/`detail`, plus the
`upstreamCode` extension carrying the game API's error code). Routes declare error
statuses with a `content: {'application/problem+json': …}` response schema so the
spec and the generated webapp client see the real media type. Everything else from
ADR-0003 (TypeBox as source of truth, spec + client regeneration) is unchanged.

## Consequences

- Clients branch on HTTP status, not on an `ok` discriminant; there is no
  envelope type to drift from its schema.
- Only schema-declared routes follow the convention so far; Fastify's default
  error shape (thrown errors, validation failures) is not yet problem+json — a
  `setErrorHandler` could close that gap later.
- Anything the API means to say on failure must fit Problem Details (or an
  extension member on it).
