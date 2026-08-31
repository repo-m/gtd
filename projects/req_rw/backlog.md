# Backlog

Queued multi-iteration efforts. Not read by `loop.sh` or `AGENT.md` — a human copies one item into `PROMPT.md` per iteration, same as any other task.

## E2E smoke suite (Playwright, browser mode)

Specs to load: none — this is test infrastructure, not spec-derived behavior. Reference: `test_concept.md`.

1. [x] Add `app/playwright.config.ts` targeting the `npm run web` dev server, tests in `app/tests/e2e/`. Gate: `npx playwright test --list` succeeds.
2. [x] `app/tests/e2e/smoke.spec.ts` — cold load renders the demo doc in TableView, no console errors.
3. [x] Journey: create a requirement (command palette) + edit a rich-text field; both stick.
4. [x] Journey: undo/redo round-trip.
5. [x] Journey: search narrows results; filter panel changes row count.
6. [x] Journey: Save — intercept via `page.on('download')`, assert the YAML content includes the step-3 edit.
7. [x] Add `test:e2e` script to `app/package.json`; document it in `README.md`'s Key commands. Do NOT add it to the `loop.sh` gate.

## Design brief spec

Specs to load: `50-theming.md`, `51-styling-architecture.md`, `52-iconography.md`. Goal: write down the aesthetic direction those token/architecture specs already enforce, so future changes can be audited against an explicit brief instead of ad hoc taste — same role `bugs.md` plays for spec conformance.

1. [x] Add `specs/53-design-brief.md`: one-sentence design direction (e.g. "VS Code chrome + Google Sheets grid" — already implicit in commit history), the 1–2 reference apps it's benchmarked against, and *why* the existing token choices in `50-theming.md` serve that direction.
2. [x] Document the minimalism-by-subtraction principle: primary content surface (table/tree) gets the most restraint/polish; chrome (menubar/sidebar/statusbar) stays quiet — ties to the existing `.btn` (content) vs `.menu-btn` (chrome) class split.
3. [x] Document the single spacing scale and type scale as the enforced rhythm — cross-reference `50-theming.md`'s token list rather than duplicating it.
4. [x] Document expected micro-state consistency (hover/focus/active/disabled/empty) as a named rule, referencing `51-styling-architecture.md`'s existing CSS-class-only rule — this is where most of `bugs.md`'s past churn has come from.
5. [x] Add a cross-reference from `51-styling-architecture.md` and `50-theming.md` to the new spec 53, same pattern used for other spec cross-links.
