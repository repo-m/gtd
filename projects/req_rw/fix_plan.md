STATUS: DONE

## Steps

- [x] S1 — Fix CommandPalette.tsx's Navigate section to exclude the root sentinel id (extracted `buildNavCommands.ts`, filters `id !== rootId`)
- [x] S2 — Verify sidebar never renders a row for root (confirmed: `ReqTree.tsx` maps `root.children`, never `root` itself; `ReqTreeItem.tsx` has no context menu)
- [x] S3 — Check LinkField/selectFileLinkset for reachable root leaks; fix or confirm unreachable (confirmed unreachable: `LinkField` is read-only, no in-app link-creation UI exists, and it's only rendered for `TableView` rows which already exclude root via `visibleReqIds`)
- [x] S4 — Check context menus for root-id label/navigation leaks (confirmed clean: `useTableContextMenu.ts`'s `menu.reqId` only ever comes from `visibleReqIds`, which excludes root)
- [x] S5 — Check export output (ReqIF/YAML) for user-visible (not structural) root leaks (confirmed clean: ReqIF export explicitly skips `req.id === fileState.root`; `.rq` YAML save includes root only in its documented structural role per specs/20-requirement-tree.md)
- [x] S6 — Check appSetError call sites that interpolate a req id (confirmed clean: grepped every call site, none interpolate a req id)
- [x] S7 — Add regression test if a natural place exists (added `buildNavCommands — root sentinel exclusion` in `commandPalette.test.ts`)
- [x] S8 — Mark bugs.md BUG-009 RESOLVED with today's date, summarizing findings
- [x] S9 — Run gate command (`npm test`) and confirm exit 0 (167/167 tests passed)
