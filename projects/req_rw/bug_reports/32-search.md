# Bug Report: 32-search.md
Date: 2026-06-09
Status: FIXED

## Summary
Core search infrastructure (slice, middleware, highlighting) is implemented correctly, but `searchStart` is never dispatched when the view mode changes, so search results are silently cleared and never re-run on view switches. Three additional, smaller deviations exist.

## Bugs

### Bug 1: `searchStart` is never dispatched on view mode change
- **Location:** `src/frontend/components/MenuBar.tsx:241-249`
- **Issue:** When the user clicks a view-mode button, only `appSetContentMode(mode)` is dispatched. The spec requires `searchStart()` to also be dispatched so the middleware re-runs the search after the results are auto-cleared by `extraReducers`. Neither `MenuBar.tsx` nor any other component ever dispatches `searchStart`. The action is exported and handled by the middleware but has no callsite.
- **Expected:** After a view-mode change, with an active search term, the middleware should receive `searchStart()`, re-read `state.file.present.requirements`, and repopulate results. Currently results stay empty until the user edits the search input.
- **Status:** FIXED

### Bug 2: `searchStart` middleware path omits the required `searchClear()` dispatch
- **Location:** `src/frontend/store/searchMiddleware.ts:87-93`
- **Issue:** The spec algorithm says both triggering actions must (1) cancel in-flight work, **(2) dispatch `searchClear()`**, (3) bail if term is empty. The `searchSetValue` path does dispatch `searchClear()` (line 79). The `searchStart` path does not — it calls `runSearch()` directly. When `runSearch` finds results, it dispatches `searchSetResults` without first clearing, leaving stale results briefly in state (even though the operation is synchronous today, the spec contract is broken).
- **Expected:** The `searchStart` branch should dispatch `api.dispatch(searchClear())` before calling `runSearch(api)`.
- **Status:** FIXED

### Bug 3: Exported selector name does not match spec; selector unused by consumers
- **Location:** `src/frontend/store/searchSlice.ts:110`
- **Issue:** The spec names the selector `selectSearchResultsByIdField(id, field)` — a two-argument selector. The implementation exports it as `makeSelectSearchResultsByIdField` (a factory that returns a selector). Additionally, neither `RichTextField` (`src/frontend/components/Field/RichTextField.tsx:15`) nor `MarkableText` (`src/frontend/components/MarkableText.tsx:11`) uses this export; both inline the lookup directly.
- **Expected:** Export a selector named `selectSearchResultsByIdField` (or rename the factory to match), and have field components call it as the spec describes.
- **Status:** FIXED

### Bug 4: `menuBarData/entryDataSearch.ts` does not exist
- **Location:** file unknown (expected at `src/frontend/components/MenuBar/menuBarData/entryDataSearch.ts`)
- **Issue:** The spec lists this file as a relevant file for the search feature. It does not exist. The MenuBar is implemented as a single flat component file (`MenuBar.tsx`) with search UI inlined rather than split into a dedicated data module.
- **Expected:** A `menuBarData/entryDataSearch.ts` module (or equivalent named file) containing the search-related menu entry data, as the spec's file layout indicates.
- **Status:** FIXED
