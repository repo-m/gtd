---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Views

The app has two separate "view" concepts that are easy to confuse:

1. **Content mode** – which top-level display is shown (table, raw JSON, raw YAML, ReqIF XML)
2. **Named views** – saved column configurations for the table view

---

## Content modes (`appSlice.contentMode`)

Switched via the *View* group in the MenuBar Home tab or via `appSetContentMode`.

| Constant | Component | Description |
|----------|-----------|-------------|
| `VIEW_MODE_TABLE` | `TableView` | Default. Requirements as a resizable-column table. |
| `VIEW_MODE_RAW` | `RawStoreView` | Pretty-printed JSON dump of the current Redux file state. Read-only. |
| `VIEW_MODE_FILE` | `RawFileView` | YAML representation of the document (as it would be written to disk). Read-only. |
| `VIEW_MODE_REGIF` | `RegIfView` | ReqIF 1.2 import/export. See [42-reqif-export.md](42-reqif-export.md). |

Switching content mode clears the search results (`searchSlice` extra reducer on `appSetContentMode`).

---

## Named views (column configurations)

A *view* is a list of column descriptors: `[{ label, field, width? }, …]`. Multiple named views can be configured per document.

**View config is stored entirely in workspace preferences** (`~/.req_rw/prefs.json` on desktop, `localStorage` on web) — never in the `.rq` file. This follows the VS Code model: documents are pure data, personal state lives outside them. See `13-workspace-prefs.md`.

### State in `appSlice`

`appSlice` is the sole source of truth for view config at runtime:

| Field | Type | Description |
|-------|------|-------------|
| `viewName` | `string \| null` | Name of the active named view (`null` → use `VIEW_DEFAULT_NAME`) |
| `views` | `Record<string, NamedViewDef>` | All named view configs loaded from prefs for the current file |

These fields are populated from prefs when a file is opened (via `appLoadFileState`) and are reset when a new file is opened.

### Default view

`VIEW_DEFAULT` is the built-in fallback column list, used when no prefs entry exists for the current file:

```js
VIEW_DEFAULT = [
  { label: "ID",           field: "id",       width: 50  },
  { label: "Requirements", field: "content"              },   // no width → fills remaining space
  { label: "Category",     field: "Category", width: 120 },
  { label: "Links",        field: "links",    width: 60  },
  { label: "Status",       field: "Status",   width: 120 },
]
```

The `content` column intentionally has no `width` so it absorbs all remaining horizontal space. The other four columns are short fixed fields that do not need unbounded width. Fixed widths here are initial defaults only — once the user drags a column, the persisted prefs value takes over.

`VIEW_DEFAULT_NAME = "default"` is the name used when `viewName` is `null`.

`Category` and `Status` match the fields seeded by `getNewFileState()` (see `10-file-management.md`). For documents that do not have those fields (e.g. existing files opened before these defaults were introduced), `selectAppCurrentView` must silently drop any column whose `field` has no matching entry in `fileSlice.fields` — it must never error or render a broken column.

The built-in fields (`id`, `content`, `links`) are structural and always present. They are never considered missing or hidden by any mismatch logic.

### Column width

`width` is optional on every column. A column without a stored `width` fills the remaining table width — it does not have a fixed pixel size. Once the user drags a column to a new size, the width is stored in prefs and used on subsequent opens.

### Selectors

**`selectAppCurrentView`** (memoized) produces the resolved column list:

1. Take `appSlice.views[viewName ?? VIEW_DEFAULT_NAME]?.columns ?? VIEW_DEFAULT`
2. Enrich each column with its `fieldDef` from `fileSlice.fields` → `ResolvedColumn[]`
3. Drop any column whose `field` has no matching entry in `fileSlice.fields` (and is not a built-in field)

There is no file-layer in the merge. `fileSlice` contributes only `fields` (for field type metadata), not view structure.

---

**`selectAppViewMismatches`** (memoized) computes the mismatch between the active view and the open document's custom fields. It drives two UI indicators: the `⚠ N fields` warning button in `StatusBar` (see `63-statusbar.md`) and the `+N fields ›` hidden-fields badge in `TableView` (see `30-table-view.md`).

```ts
interface ViewMismatches {
  missingFromFile: string[]  // field names in the view but absent from fileSlice.fields
  hiddenFromView:  string[]  // field names in fileSlice.fields not referenced by any view column
}
```

Rules:
- Only custom fields (`fileSlice.fields`) participate. Built-in fields (`id`, `content`, `links`) are excluded from both lists.
- `missingFromFile` is derived from the raw view column list **before** the drop step in `selectAppCurrentView` — it is the set of non-built-in column fields that would be dropped.
- `hiddenFromView` is derived from `fileSlice.fields` minus the set of field names present in the active view columns.
- Both lists are empty when there is no mismatch, which is the common case. The UI indicators are hidden when their respective list is empty.

### Switching named views

The *View* tab of the MenuBar contains a `<select>` listing all available named views. Selecting one dispatches `appSetViewName(name)` and saves the updated `active_view` to prefs via `api.saveFileState(...)`.

### Editing named views (add / remove / rename / reorder columns)

Named views are user preferences, not document attributes. They are managed through the **View Editor** modal — a dedicated UI surface separate from the Attributes dialog. See [`34-view-editor.md`](34-view-editor.md) for the full spec.

In summary: the View Editor dispatches `appSetCurrentView`, `appAddView`, `appRenameView`, or `appDeleteView` and saves to prefs after each change. The `.rq` file is never touched.

### Persistence on change

Any change to view config (column resize, view switch, view edit) immediately calls `api.saveFileState(key, currentState)`. There is no debounce — column resize fires once on mouse-up, not per pixel.

---

## Relevant files

- `app/src/frontend/constants/view_constants.ts` – `VIEW_DEFAULT`, `VIEW_DEFAULT_NAME`, mode constants
- `app/src/frontend/store/appSlice.ts` – `contentMode`, `viewName`, `views`, `appSetCurrentView`, `appSetViewName`, `appLoadFileState`, `selectAppCurrentView`, `selectAppViewMismatches`
- `app/src/frontend/api/baseApi.ts` – `saveFileState`