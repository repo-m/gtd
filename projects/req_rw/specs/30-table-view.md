# Feature: Table View

The table view is the default and primary way to read and edit requirements. It shows requirements as rows and configurable fields as resizable columns.

---

## Layout

```
┌────┬─────────────────────────┬───────┐  ← thead (column headers, resizable)
│ ID │ Requirements            │ Links │
├────┼─────────────────────────┼───────┤
│  1 │ ▶ First heading         │  ↗↙   │  ← heading row
│  3 │   Sub-requirement text  │       │  ← entry row (indented by level)
│  2 │ ▶ Second heading        │       │
└────┴─────────────────────────┴───────┘
│ (empty footer – double-click to add)  │
```

Columns are defined by the active *view* (see [33-views.md](33-views.md)). Each column maps to a field name and a label.

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

## Column resizing

Each column header has a drag handle. On drag, `onResize` dispatches `appSetCurrentView` with updated `width` values. Widths are persisted in the view definition (in `appSlice.views`).

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

## Relevant files

- `src/frontend/views/TableView/TableView.tsx` – main component
- `src/frontend/views/TableView/TableCellContent.tsx` – per-cell field dispatch
- `src/frontend/views/TableView/useTableContextMenu.ts` – context menu hook
- `src/frontend/components/Table/` – generic resizable table primitives
- `src/frontend/components/Field/` – all field components
- `src/frontend/store/appSlice.ts` – `appSetFocus`, `appToggleFocus`, `appSetCurrentView`
- `src/frontend/store/fileSliceMemoSelector.ts` – `selectFileReqList`
