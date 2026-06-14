# Bug Report: 40-links.md
Date: 2026-06-09
Status: FIXED

## Summary
Two clear deviations from the spec: right-clicking an icon does not open the direction-specific link menu, and the `href` for integer out-entries points to the wrong requirement id.

## Bugs

### Bug 1: Right-click on link icons does not open direction-specific link menu
- **Location:** `src/frontend/components/Field/LinkField.tsx:37-59`
- **Issue:** The ↗ and ↙ spans only have an `onClick` handler (`openMenu`). There is no `onContextMenu` handler. Right-clicking either icon fires the table-cell-level context menu (`useTableContextMenu`) which shows generic row operations (copy/cut/paste/add/remove), not the per-direction link list.
- **Expected:** Per spec §"UI: LinkField" — "Clicking or right-clicking either icon opens a context menu listing the links for that direction." Both click and right-click on each icon should open `openMenu` for the corresponding direction.
- **Status:** FIXED

### Bug 2: Integer out-entry `href` uses `targetId` instead of `sourceId`
- **Location:** `src/frontend/store/fileSliceMemoSelector.ts:54-56`
- **Issue:** For integer links the implementation builds:
  ```
  href: `req://${filepath}#${targetId}`
  ```
  The spec requires:
  ```
  href = req://${filepath}#${sourceId}
  ```
- **Expected:** Per spec §"Linkset computation" — the `out` entry's `href` fragment should be `#${sourceId}` (the id of the requirement that owns the link), not `#${targetId}` (the id of the requirement being pointed at).
- **Status:** FIXED

### Bug 3: `FIELD_TYPE_LINKS` constant not exported from `field_constants.ts`
- **Location:** `src/frontend/constants/field_constants.ts` (entire file)
- **Issue:** The spec's "Relevant files" section lists `src/frontend/constants/field_constants.ts – FIELD_TYPE_LINKS`, implying a named export `FIELD_TYPE_LINKS`. The file exports `FIELD_TYPES` (an array including `'Links'`) and the `FieldType` union, but no standalone `FIELD_TYPE_LINKS` constant. No other file in the codebase references `FIELD_TYPE_LINKS` either.
- **Expected:** A named export `FIELD_TYPE_LINKS` (e.g., `export const FIELD_TYPE_LINKS = 'Links' as const`) accessible to consumers who need to discriminate the links field type without depending on the string literal.
- **Status:** FIXED
