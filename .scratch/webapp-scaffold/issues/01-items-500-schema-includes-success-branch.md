# items /500 response schema includes the success branch

Status: wontfix (superseded)

Triage 2026-09-22: superseded by [07-problem-json-migration.md] — the ApiResult
envelope is being removed entirely, so there is no union to split; error
responses become RFC 9457 problem+json.

From the 2026-09-22 code review (spec axis, finding c.6). In
`packages/server/src/routes/items.routes.ts` the 500 response is declared as the
full `ApiResultSchema(...)` union, so the generated webapp client types a 500 as
possibly `{ok: true, data: [...]}` (`GetItemsErrors[500]` in
`packages/webapp/generated-src/api/types.gen.ts`).

Fix: split the envelope in `@artifacts/shared` into success/error halves (e.g.
`ApiOkSchema(data)` / `ApiErrSchema`, union kept for convenience) and declare only
the error half for 500. Could also absorb the duplicated
`{ok: false, error: {message: 'upstream error', ...}}` literal (standards axis,
Duplicated Code — also in `/server-status`) into a helper. Regenerate spec +
webapp client afterwards.
