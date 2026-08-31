---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Table View

The table view is the default and primary way to read and edit requirements. It shows requirements as rows and configurable fields as resizable columns.

---

## Layout

```
┌────┬─────────────────────────┬───────┬──────────────────────── │
│ ID │ Requirements            │ Links │  +2 fields ›            │  ← thead; badge conditional
├────┼─────────────────────────┼───────┤                         │
│  1 │ ▶ First heading         │  ↗↙   │                         │  ← heading row
│  3 │   Sub-requirement text  │       │                         │  ← entry row (indented by level)
│  2 │ ▶ Second heading        │       │                         │
└────┴─────────────────────────┴───────┴─────────────────────────┘
│ (empty footer – double-click to add)                           │
```

Columns are defined by the active *view* (see [33-views.md](33-views.md)). Each column maps to a field name and a label.

---

## View mismatch indicators

`TableView` reads `selectAppViewMismatches` (see `33-views.md`) to surface one conditional UI element. It is hidden when its list is empty (the common case).

> **Note:** The `missingFromFile` indicator has moved to the **StatusBar** (see `63-statusbar.md`). `TableView` no longer renders a mismatch banner.

### Hidden-fields badge

Rendered as a **non-resizable pseudo-column at the far right of `<thead>`**, when `hiddenFromView` is non-empty.

```
│ ID │ Requirements │ Status │  +3 fields ›  │
```

- Label: `+N fields ›` where N is `hiddenFromView.length`.
- Hovering shows a tooltip listing the hidden field names.
- Clicking opens the View Editor modal (same action as `[Edit View →]` in the banner).
- The pseudo-column has no corresponding `<td>` cells in data rows — it exists only in `<thead>`.

---

---

## Row data

`selectFileReqList` produces a flat ordered DFS array of requirement ids. Each row index maps to one id. The table component (`Table`) receives this array as `data`.

---

## Column rendering

Each cell renders `<TableCellContent id={reqId} field={fieldName} />`, which dispatches to the correct `Field` component based on field type:

| Field type | Component | Notes |
|-----------|-----------|-------|
| `id` | `IdField` | Numeric id + indentation level indicator |
| `content` | `ContentField` | Combined heading + text display |
| `links` | `LinkField` | Inward/outward link arrow icons |
| `String` | `SingleLinePlainTextField` | Single-line plain text |
| `RichText` | `RichTextField` | Lexical rich text editor |
| `Enumeration` | `EnumField` | Read mode: current value as plain text (blank if unset). Edit mode: `<select>` dropdown populated from the field's `values[]`, with a leading empty option to allow clearing the value. Dispatches `fileUpdateReqField({ id, field, value })` on change. |
| `raw` | `RawField` | JSON dump of the raw field value |
| numeric | `NumField` | Numeric input |

---

## Focus and edit mode

Two-level interaction model:

1. **Focus** – clicking a cell dispatches `appToggleFocus({ id, field })`. The focused cell is visually highlighted. Only one cell is focused at a time.
2. **Editable** – double-clicking a focused cell dispatches `appSetFocus({ id, field, editable: true })`. The field component then renders in edit mode (e.g. Lexical editor becomes writable).

These states live in `appSlice.focus`:
```js
{ id, field, editable, index, children[] }
```

`children` is the list of all descendant ids of the focused req (used for visual highlighting of sub-trees).

Edit mode (the global toggle) must be on for double-click editing to work. Without edit mode, the table is read-only.

**Exception — post-create auto-edit:** When a new requirement is created via `fileCreateNextReq` or `fileCreateChildReq`, the action dispatches `appSetFocus` with `editable: true` directly. This bypasses the `editMode` gate — the newly created cell enters edit mode immediately regardless of whether the Edit toggle is active.

**Click isolation inside editable cells:** When a cell is already in edit mode (`editable: true`), click events that originate inside the field component must not propagate to the `<td>` row handler. If they do, the `onClick` handler dispatches `appToggleFocus`, which clears focus and immediately exits edit mode — making the cell impossible to interact with. Every editable field component (`RichTextEditor`, `SingleLinePlainTextField`, `NumField`, and any editable input rendered by `ContentField`) must call `e.stopPropagation()` on click events so the row-level handler is not triggered while the cell is being edited.

The Home tab of the `MenuBar` must include an **Edit** toggle button that dispatches `appSetEditMode(true/false)`. Its visual state must follow the same highlighted-button pattern used by Sidebar and Search (i.e. `background: '#e8f0fe'` when active, `'#fff'` when inactive). `editMode` starts as `false` — the user must explicitly enable it before any cell becomes editable.

Double-clicking the table footer (`<tfoot>`) creates a new sibling req at the end of the list.

---

## Visual appearance

### Grid lines

The table renders a full Excel-style grid: both horizontal (row separators) and vertical (column separators) borders.

- `th` (`.table-header-cell`): `border-bottom: 1px solid var(--color-border-strong)` and `border-right: 1px solid var(--color-border-strong)`. Both borders use the stronger token so the header row stands out uniformly.
- `td` (`.table-cell`): `border-bottom: 1px solid var(--color-border)` and `border-right: 1px solid var(--color-border)`.

The last column in every row (`th:last-child`, `td:last-child`) must have `border-right: none` to avoid a dangling right edge against the viewport.

### Sticky column headers

`<thead> th` must have `position: sticky; top: 0; z-index: 1` so column labels remain visible when the user scrolls past the first ~20 rows. This is a pure CSS rule on `.table-header-cell`.

### Row hover

`.table-data-row:hover` must set `background: var(--color-bg-hover)`. The rule must not override `.is-focused-row` or `.is-child-of-focused`, which take higher visual priority. Implement as a plain CSS `:hover` rule — no JS event handlers (see `51-styling-architecture.md`).

### Heading row visual treatment

Heading requirements (where `req.type === 'heading'`) receive the CSS class `.is-heading-row` on their `<tr>` element. The class applies:
- `background: var(--color-bg-subtle)` — distinguishes structural rows from entry rows
- `border-bottom: 2px solid var(--color-border)` — communicates hierarchy break

Font weight on heading rows is already `var(--font-weight-semi)` via the `content` field renderer. No additional weight rule is needed here.

### Cell line-height

`.table-cell` must set `line-height: var(--line-height-base)` (1.5). Without an explicit value, the browser default (~1.2) makes multi-line rich-text cells visually cramped.

### Resize handle affordance

The `.resize-handle` element must have a visible background (`background: var(--color-separator)`) so it is discoverable without accidentally mousing to the exact right edge. On `:hover` the background darkens to `var(--color-border)`.

---

## Column resizing

Each column header has a drag handle. On drag, `onResize` dispatches `appSetCurrentView` with updated `width` values. Widths are persisted in the view definition (in `appSlice.views`).

The minimum column width is **40 px** (`MIN_COLUMN_WIDTH = 40` in `useColumnResize.ts`). The resize handler must clamp any dragged width below this floor to 40 px. This prevents layout breakage when a user drags a column to near-zero.

---

## Context menu

Right-clicking any row opens a context menu with three groups:

1. **Select / Edit field** – focus or open editor for the clicked cell
2. **Clipboard** – copy (single), copy (with children), cut, paste as sibling, paste as child
3. **CRUD** – add sibling, add child, remove (with children)

Implemented in `useTableContextMenu.ts`.

---

## Keyboard-driven scroll

After any focus change, `TableView` scrolls the focused cell into view using `scrollIntoView` + a small top-margin guard (20 px). Horizontal scroll position is preserved when focusing a row without a specific field.

---

---

## Multi-select

Row-level multi-select lets the user select multiple requirements for bulk operations. Selection is independent of cell focus — a focused cell is the single cell open for editing; selection is the set of rows targeted by bulk actions.

### State

Two new fields in `appSlice`:

```ts
selection: number[]            // ordered list of selected req ids (DFS display order)
selectionAnchor: number | null // anchor row for Shift+click range extension
```

New actions in `appSlice`:
- `appSetSelection(ids: number[])` — replace the full selection; sets anchor to the last id in `ids` (or `null` if empty)
- `appClearSelection()` — empty the selection and clear the anchor

### Gestures

The `TableView` handles `onClick` on each `<tr>` and inspects `event.shiftKey` / `event.metaKey || event.ctrlKey`:

| Gesture | Dispatches | Effect |
|---------|-----------|--------|
| Plain click | `appToggleFocus({ id, field })` + `appSetSelection([id])` | Focus cell; selection shrinks to that one row; anchor = id |
| Shift+Click | `appSetSelection(range)` | Compute range from `selectionAnchor` to clicked id (inclusive) using the current DFS-ordered `data` prop; anchor unchanged |
| Ctrl/Cmd+Click | `appSetSelection(toggled)` | Toggle the clicked id in the existing selection; anchor = clicked id |
| Ctrl/Cmd+A | `appSetSelection(allIds)` | Select all rows in the current `data` list; anchor = last id |

Range computation (Shift+Click) uses the DFS-ordered `data` array — the same array `TableView` already receives as its `data` prop — to find the indices of anchor and target, then slices the subarray between them (order preserved, both endpoints included).

### Visual treatment

- `<tr>` receives the CSS class `.is-selected-row` when its req id is in `selection`.
- `.is-selected-row` sets `background: var(--color-bg-selection)`.
- Priority order (highest wins): `.is-focused-row` > `.is-child-of-focused` > `.is-selected-row` > `.is-heading-row` > hover.
- A row can be both focused and selected; in that case `.is-focused-row` wins visually.

### Context menu adaptation

When `selection.length > 1`, `useTableContextMenu` replaces the per-row clipboard and CRUD groups with a single **Bulk** group:

- **Copy selected (N)** — calls `api.copy(selection, false)`, which dispatches `appUpdateClipboard({ reqIds: selection, operation: 'copy' })` and writes the OS clipboard (see `41-clipboard.md`).
- **Cut selected (N)** — calls `api.cut(selection)`, which dispatches `appUpdateClipboard({ reqIds: selection, operation: 'cut' })` and writes the OS clipboard (see `41-clipboard.md`).
- **Delete selected (N)** — dispatches `fileDeleteReq` for each id in `selection`, iterating in reverse DFS order (deepest-last-first) so parent deletions do not orphan children mid-loop.

When `selection.length === 1`, the context menu is identical to existing behaviour (no change).

### Clearing selection

`appClearSelection()` is dispatched on:
- `fileInit` (file open / new document)
- Any `fileDeleteReq` dispatch (selection is invalidated after deletion)

---

## Relevant files

- `app/src/frontend/views/TableView/TableView.tsx` – main component
- `app/src/frontend/views/TableView/TableCellContent.tsx` – per-cell field dispatch
- `app/src/frontend/views/TableView/useTableContextMenu.ts` – context menu hook
- `app/src/frontend/components/Table/` – generic resizable table primitives
- `app/src/frontend/components/Field/` – all field components
- `app/src/frontend/store/appSlice.ts` – `appSetFocus`, `appToggleFocus`, `appSetCurrentView`, `appSetSelection`, `appClearSelection`
- `app/src/frontend/store/fileSliceMemoSelector.ts` – `selectFileReqList`