# Task

Fix `bugs.md`'s BUG-009: audit all user-facing surfaces for the root sentinel requirement id leaking through, and fix what you find.

## Starting point (already confirmed — verified before writing this task, don't re-derive)

- **`StatusBar.tsx`'s req count is already correct** — it uses `selectFilteredDisplayCount`/`selectTotalDisplayCount` (both filter root, per `fileSliceMemoSelector.ts`). No fix needed there.
- **`CommandPalette.tsx` has a confirmed leak**: its "Navigate" section (`selectFileReqList` → `reqIds.map(...)`, around line 106) does not filter out the root id, so the root sentinel appears as a selectable `REQ-<rootId>` entry when the palette's filter query is non-empty. `selectFileReqList` itself intentionally includes root (many other selectors build on it and need to walk the full tree) — the fix belongs at this call site, not in the shared selector. Filter it out when building `navCmds` (e.g. compare against `state.file.present.root`, obtained via `useSelector` on the root id, and skip that id).
- **Sidebar (`app/src/frontend/components/SideBar/*.tsx`) appears clean** — no direct `.root` reference found; it likely already walks from root's children rather than rendering root itself. Verify this holds (confirm the sidebar tree never renders a row for the root id) rather than assuming.
- **Not yet checked, do these as part of this task:**
  - `LinkField.tsx` / `selectFileLinkset` (`fileSliceMemoSelector.ts`) — could a malformed or edge-case link array reference the root id as a source or target, producing a visible `in`/`out` arrow labelled with the root's id? Check whether this is reachable in practice (root has no `links` field itself, and users can't select root in the UI to create a link to it) — if genuinely unreachable, say so in `fix_plan.md` rather than adding defensive code for a case that can't occur.
  - Context menus (`useTableContextMenu.ts` and any other context-menu source) — any place that builds a label or navigation target from a req id without checking against root.
  - Export output (ReqIF export, `.rq` YAML save) — the exported file format legitimately needs to represent the root/document structure internally (this is expected, not a leak) — the question is only whether the root id ever appears in a way a user would see as a *visible content field* (e.g. as if it were a real requirement's id in an exported table/report), not in its correct structural role. If ReqIF/YAML export is working as designed structurally, say so and move on — don't invent a problem.
  - Any error messages (`appSetError` calls) that might interpolate a req id that could be root (e.g. from a failed operation on the currently-focused item, if focus could ever land on root).

## Specs to load

- specs/20-requirement-tree.md
- specs/65-command-palette.md

Also read (implementation detail): `LinkField.tsx`, `fileSliceMemoSelector.ts`, `useTableContextMenu.ts`, `SideBar/*.tsx`, and grep for `appSetError` call sites that interpolate a req id.

## Acceptance criteria

1. `CommandPalette.tsx`'s Navigate section no longer lists the root sentinel id as a navigable entry.
2. Every other named surface (link labels, context menus, export output, error messages) is either confirmed clean (with a one-line note in `fix_plan.md` on how you verified it) or fixed.
3. No new fields, no new UI, no behavioral change beyond removing root-id leaks.
4. `npm test` passes; add a regression test if there's a natural place for one (e.g. a `commandPalette.test.ts` case asserting the Navigate section excludes root) — don't force one where it doesn't fit.
5. Mark `bugs.md`'s BUG-009 **RESOLVED** with today's date, following the file's existing convention, summarizing what was found/fixed and what was confirmed already-clean.

## Done when

The audit is complete (every named surface addressed one way or the other), the confirmed CommandPalette leak is fixed, BUG-009 is marked resolved, and the gate command passes.

## Gate command

```
npm test
```

## Out of scope

- BUG-011 — separate, still-open item; do not touch.
- Any change to `selectFileReqList` itself (fix leaks at call sites, not by changing what the shared selector returns).
- Any unrelated refactor.
