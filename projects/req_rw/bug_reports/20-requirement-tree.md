# Bug Report: 20-requirement-tree.md
Date: 2026-06-09
Status: OPEN

## Summary
The tree helpers and CRUD reducers are largely correct, but `updateMeta()` is not called after two important state changes — `fileUpdateReq` and `fileInit` — leaving `level` and `num` stale or undefined. There is also a naming mismatch for `FIELD_LIST_DEFAULT`.

## Bugs

### Bug 1: `fileUpdateReq` does not call `updateMeta()`
- **Location:** `src/frontend/store/fileSlice.ts:187-194`
- **Issue:** `fileUpdateReq` mutates an arbitrary field on a requirement (including `heading`) but never calls `updateMeta()`. Changing `heading` from a non-empty to empty string (or vice versa) flips the heading/entry classification and changes the correct `num` value for the req and all its siblings, but the stale computed fields remain until a subsequent CRUD operation triggers `updateMeta`.
- **Expected:** The spec states "After every mutation `updateMeta()` traverses the tree and assigns `req.level` and `req.num`." `fileUpdateReq` is a mutation and must call `updateMeta()`.
- **Status:** FIXED

### Bug 2: `fileInit` does not call `updateMeta()`
- **Location:** `src/frontend/store/fileSlice.ts:116-119`
- **Issue:** `fileInit` sets the Redux state from a loaded `FileState` but never calls `updateMeta()`. Because `level` and `num` are not persisted (correctly excluded by `FIELD_LIST_INTERNAL`), after loading a file all requirements have `level` and `num` as `undefined`. These stay undefined until the first CRUD mutation (create/delete/import) that happens to call `updateMeta()`.
- **Expected:** Computed fields `level` and `num` should be valid immediately after a file is loaded so the table view can render numbering without requiring a mutation first.
- **Status:** FIXED

### Bug 3: `FIELD_LIST_DEFAULT` not exported — `FIELD_DEFAULT` exported instead
- **Location:** `src/frontend/constants/field_constants.ts:1-4`
- **Issue:** The spec's relevant-files section references `FIELD_LIST_DEFAULT` as an export from `field_constants.ts`. The implementation exports `FIELD_DEFAULT` (a plain object `{ children: [], links: [] }`) with no `FIELD_LIST_DEFAULT` export.
- **Expected:** `field_constants.ts` should export `FIELD_LIST_DEFAULT` per the spec, or the spec name should match `FIELD_DEFAULT` — as written the names diverge.
- **Status:** FIXED

### Bug 4: Create operations do not enter edit mode on the new requirement
- **Location:** `src/frontend/store/fileSlice.ts` — `fileCreateNextReq`, `fileCreateChildReq`
- **Issue:** Both create reducers dispatch a focus action after inserting the new req, but neither dispatches `appSetFocus` with `editable: true`. The newly created row becomes focused but remains read-only. The user must manually double-click the cell to begin editing — defeating the purpose of immediately creating a new row.
- **Expected:** Both `fileCreateNextReq` and `fileCreateChildReq` must dispatch `appSetFocus({ id: newId, field, editable: true })` after insertion, where `field` is the first editable field of the new req in the active view. This must bypass the global `editMode` toggle (see `specs/30-table-view.md` — post-create auto-edit exception).
- **Status:** OPEN
