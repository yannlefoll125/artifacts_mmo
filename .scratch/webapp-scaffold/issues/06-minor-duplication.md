# Minor duplication from mirroring the server's codegen setup

Status: done (fixed 2026-09-22)

Triage 2026-09-22: fix both. (a) hoist `nocheck-runtime.mjs` to a shared
location taking the generated dir as an argument; (b) delete the hyphenated
`type-check` script and point webapp `build`'s `run-p` at `typecheck`.

From the 2026-09-22 code review (standards axis, Duplicated Code — judgement
calls). `scripts/nocheck-runtime.mjs` exists near-identically in server and
webapp (could take the generated dir as an argument from a shared location);
webapp `package.json` carries twin `type-check`/`typecheck` scripts (create-vue's
name vs the workspace convention — could point `build`'s `run-p type-check` at
one name and drop the other).
