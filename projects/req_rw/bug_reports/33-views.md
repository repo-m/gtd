# Bug Report: 33-views.md
Date: 2026-06-09
Status: FIXED

## Summary
The content-mode switching and named-view data structures are largely in place, but the named-view selection UI is entirely absent from the MenuBar and `selectAppCurrentView` is never consumed. TableView also uses the wrong fallback key for column-resize persistence, and the "default" view can be deleted via the Attributes dialog.

## Bugs

### Bug 1: No "View" tab / MenuSelect for named-view selection in MenuBar
- **Location:** `src/frontend/components/MenuBar.tsx:30-31`
- **Issue:** The MenuBar only has `'File'` and `'Home'` tabs. There is no "View" tab and no `MenuSelect` component listing available named views. `appSetViewName` is defined but never dispatched from any component.
- **Expected:** The spec requires a *View* tab in the MenuBar containing a `MenuSelect` that lists all available named views and dispatches `appSetViewName(name)` on selection.
- **Status:** FIXED

### Bug 2: `selectAppCurrentView` is defined but never used
- **Location:** `src/frontend/store/appSlice.ts:157` (selector defined), `src/frontend/views/TableView/TableView.tsx:35-43` (duplicate inline logic)
- **Issue:** `selectAppCurrentView` — the memoized selector that merges column lists with `fieldDef` from `fileSlice.fields` — is exported but never imported or called by any component. `TableView` duplicates the column-resolution logic inline and never populates `fieldDef`.
- **Expected:** `TableView` (and any other consumer) should call `selectAppCurrentView` to obtain `ResolvedColumn[]` including `fieldDef` data from `fileSlice.fields`.
- **Status:** FIXED

### Bug 3: TableView uses `'_default'` instead of `VIEW_DEFAULT_NAME = 'default'` for column-resize persistence
- **Location:** `src/frontend/views/TableView/TableView.tsx:19,85`
- **Issue:** `DEFAULT_VIEW_KEY = '_default'` is a local constant that differs from `VIEW_DEFAULT_NAME = 'default'`. When no named view is active and the user resizes columns, `appSetCurrentView` is called with `viewName: '_default'`, storing widths under `appViews['_default']`. The injected default entry lives under `appViews['default']`, so the persisted resize widths are never merged back into the displayed columns.
- **Expected:** The fallback key should be `VIEW_DEFAULT_NAME` (`'default'`), matching the key injected on file load.
- **Status:** FIXED

### Bug 4: `VIEW_DEFAULT_NAME = "default"` view can be deleted via Attributes dialog
- **Location:** `src/frontend/views/AttributesView/ContentViews.tsx:47-55`
- **Issue:** The `onRemove` handler in `ContentViews` removes the selected view from local state unconditionally, with no guard for `VIEW_DEFAULT_NAME`. Submitting the dialog dispatches `fileUpdateViews` with a record that omits `"default"`, removing it from `fileSlice.views`.
- **Expected:** The spec states `VIEW_DEFAULT_NAME = "default"` "cannot be removed". The UI should either hide the remove action when the default view is selected, or filter it out before saving.
- **Status:** FIXED
