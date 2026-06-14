# Bug Report: 30-table-view.md
Date: 2026-06-09
Status: OPEN

## Summary
Core table rendering, focus/edit model, column resizing, and footer double-click are implemented. Bugs 1–4 are fixed. Two new bugs identified (2026-06-10): editable field components do not stop click propagation (Bug 5), causing clicks inside an active editor to immediately clear edit mode; and `AutoFocusPlugin` may not reliably deliver browser focus to newly created requirements (Bug 6).

## Bugs

### Bug 1: Context menu entirely missing
- **Location:** `src/frontend/views/TableView/TableView.tsx` (no `onContextMenu` handler); `useTableContextMenu.ts` — file does not exist
- **Issue:** No `onContextMenu` handler is attached to table rows, the hook file `useTableContextMenu.ts` is absent, and no context-menu UI is rendered anywhere in the TableView.
- **Expected:** Right-clicking any row opens a context menu with three groups: (1) Select / Edit field, (2) Clipboard (copy single, copy with children, cut, paste as sibling, paste as child), (3) CRUD (add sibling, add child, remove with children). Implemented in `useTableContextMenu.ts`.
- **Status:** FIXED

### Bug 2: Scroll 20 px top-margin guard not implemented
- **Location:** `src/frontend/views/TableView/TableView.tsx:53-58`
- **Issue:** `el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })` is used with no top-margin guard. There is no `scrollMarginTop` CSS property on rows, no manual offset calculation, and no equivalent mechanism to keep 20 px of space above the newly-focused row.
- **Expected:** After any focus change, `TableView` scrolls the focused row into view with a 20 px top-margin guard so the row does not scroll flush to the container edge.
- **Status:** FIXED

### Bug 3: `index` field never populated in FocusState
- **Location:** `src/frontend/views/TableView/TableView.tsx:72,77`; `src/frontend/store/appSlice.ts:80-107`
- **Issue:** The spec defines the focus state shape as `{ id, field, editable, index, children[] }`. Neither `appToggleFocus` (line 80) nor `appSetFocus` (line 91) accept an `index` parameter. `handleCellClick` and `handleCellDoubleClick` never compute or pass an `index`. As a result `focus.index` is always `undefined`.
- **Expected:** The `index` field should be set to the row's position in `visibleReqIds` when focus changes, so consumers can use it for position-aware navigation.
- **Status:** FIXED

### Bug 5: Editable field components do not stop click propagation
- **Location:** `src/frontend/components/Field/RichTextField.tsx`; `src/frontend/components/Field/SingleLinePlainTextField.tsx`; `src/frontend/components/Field/NumField.tsx`; `src/frontend/components/Field/ContentField.tsx` (non-heading branch)
- **Issue:** When a cell is in edit mode, clicking inside the field component dispatches a DOM click event that bubbles up to the `<td>` row handler. This triggers `appToggleFocus({ id, field })`, which — because the cell is already focused — sets `focus = null`, immediately clearing edit mode. The user cannot click inside the field to position a cursor or interact with the editor at all. `ContentField`'s heading branch already applies `onClick={(e) => e.stopPropagation()}` on its `<input>`, but this fix was not applied to `RichTextEditor`, `SingleLinePlainTextField`, or `NumField`.
- **Expected:** Per spec § "Click isolation inside editable cells": each editable field component must call `e.stopPropagation()` on click events when the cell is in edit mode, so the row-level `appToggleFocus` handler is not triggered.
- **Status:** OPEN

### Bug 6: `AutoFocusPlugin` may not deliver reliable browser focus for newly created requirements
- **Location:** `src/frontend/components/RichTextEditor/plugins/AutoFocusPlugin.tsx`
- **Issue:** `AutoFocusPlugin` calls `editor.focus()` inside a `useEffect`. Lexical's `editor.focus()` is asynchronous — it schedules `rootElement.focus()` inside an `editor.update()` microtask. If the browser's focus is held by another element (e.g. the "Add Req" button that was just clicked) when the microtask runs, or if the update is deferred, the `ContentEditable` may not receive keyboard focus. The user would see the cell in visual edit mode but be unable to type without first clicking the editor — which Bug 5 then makes impossible.
- **Expected:** When a newly created requirement's cell enters edit mode, the `ContentEditable` must receive browser keyboard focus reliably, so the user can type immediately without any additional interaction.
- **Status:** OPEN

### Bug 4: `src/frontend/components/Table/` primitive layer absent
- **Location:** file path does not exist
- **Issue:** The spec lists `src/frontend/components/Table/` as the home for generic resizable table primitives. The directory does not exist; all column-resizing logic is inlined in `TableView.tsx` instead.
- **Expected:** A `components/Table/` directory with extracted, reusable resizable-table primitives as described in the relevant-files section of the spec.
- **Status:** FIXED
