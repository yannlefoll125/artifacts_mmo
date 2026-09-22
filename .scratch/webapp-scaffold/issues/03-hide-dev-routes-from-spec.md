# Dev/gameplay routes leak into the generated spec and webapp client

Status: wontfix

Triage 2026-09-22: these handlers were part of the initial Artifacts API
exploration and are not meant to stay. Leave them as they are; the actual
"prod" API will follow the `*.routes.ts` plugin pattern with real schemas.

From the 2026-09-22 code review (spec axis, findings b.3 and c.7). `/test`,
`/fight-chicken`, `/error` have no response schemas, so
`packages/shared/spec/openapi.yaml` documents them as bodyless 200s and the
webapp client ships untyped `getFightChicken`/`getTest`/`getError` functions.
Either mark them `schema: {hide: true}` (@fastify/swagger) to keep them out of
the spec, or give them real response schemas if the webapp should call them
(fight-chicken is plausibly wanted in the UI). Regenerate spec + client after.
