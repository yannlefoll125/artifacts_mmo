# Replace the ApiResult envelope with bare data + RFC 9457 problem+json

Status: done (fixed 2026-09-22)

From the 2026-09-22 triage of issues 01/02 (which it supersedes). The
`{ok, data} | {ok, error}` envelope was an agent choice the user never weighed
in on; the user prefers the standard shape: success responses return the bare
payload, error responses return RFC 9457 Problem Details
(`application/problem+json`).

Scope:

- `@artifacts/shared`: delete `ApiResultSchema`/`ApiResult<T>`/`ApiErrorSchema`;
  add a TypeBox `ProblemSchema` (`type`, `title`, `status`, `detail`, plus the
  `upstreamCode` extension) with its `Static<>`-derived type (keeps ADR-0003
  satisfied — this also resolves issue 02).
- Server routes (`items.routes.ts`, `/server-status`, `/health` as applicable):
  2xx declares the bare payload schema; error statuses declare `ProblemSchema`
  and reply with content-type `application/problem+json` (resolves issue 01).
- Regenerate: `yarn api:spec`, then `yarn api:client`; commit both outputs.
- Webapp call sites (`ServerHealth.vue` etc.): drop `ok` narrowing, use
  status/error from the generated client.
- Docs: amend ADR-0001 and ADR-0003 wording that names the `ApiResult<T>`
  envelope; note the problem+json convention (possibly a short new ADR).
- Dev routes `/test`, `/fight-chicken`, `/error` stay untouched (issue 03
  wontfix).
