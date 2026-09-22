# Prune create-vue scaffold leftovers

Status: done (fixed 2026-09-22)

Triage 2026-09-22: prune now. Delete the unused scaffold files, fix title and
README, trim playwright.config.ts comments; replace `HelloWorld.spec.ts` with a
`ServerHealth` unit test so unit coverage doesn't drop to zero.

From the 2026-09-22 code review (standards axis, Speculative Generality).
Unused scaffold content in `packages/webapp`: `HelloWorld.vue`, `TheWelcome.vue`,
`WelcomeItem.vue`, `components/icons/*`, `stores/counter.ts`, `AboutView.vue`,
the "You did it!" `e2e/vue.spec.ts`, boilerplate `README.md` (npm commands in a
yarn repo), commented-out blocks in `playwright.config.ts`, `<title>Vite App</title>`.
Prune what the app won't keep (or keep deliberately while the real UI takes
shape). Note `HelloWorld.spec.ts` is the only unit test — replace rather than
just delete.
