# ApiResult<T> still hand-written next to its schema

Status: wontfix (superseded)

Triage 2026-09-22: superseded by [07-problem-json-migration.md] — ApiResult<T>
and ApiResultSchema are deleted with the envelope; the problem-details schema
gets an ordinary Static<>-derived type, satisfying ADR-0003 directly.

From the 2026-09-22 code review (both axes). Decision 5 / ADR-0003 say the shared
TS types are `Static<>`-derived, but `ApiResult<T>` in
`packages/shared/src/envelope.ts` remains a hand-written union coexisting with
`ApiResultSchema` — the two can drift. Generics make a pure `Static<>` derivation
awkward; either derive the halves (`Static<ReturnType<...>>`-style from the split
schemas of issue 01) or keep the union with a comment binding it to the schema.
