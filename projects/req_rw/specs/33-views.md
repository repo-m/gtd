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

A *view* is a list of column descriptors: `[{ label, field, width? }, …]`. Multiple named views can be saved per document, stored in `fileSlice.views` (persisted to the `.rq` file).

`appSlice.viewName` holds the name of the currently active view. `selectAppCurrentView` (memoized) produces the resolved column list by merging three sources:

1. **`fileSlice.views[name].columns`** — the base column list (persisted; defines which fields appear and in what order).
2. **`appSlice.views[name].columns`** — session-only width overrides. Only the `width` property is taken from here; all other column properties come from `fileSlice`. Never written to the `.rq` file.
3. **`fileSlice.fields`** — full field definitions merged in to produce `ResolvedColumn[]`.

This means column *structure* (which fields, labels, order) is a file-level concern edited via Attributes; column *widths* are a session-level concern that reset on app restart.

The default view is always present:

```js
VIEW_DEFAULT = [
  { label: "ID",           field: "id"      },
  { label: "Requirements", field: "content" },
  { label: "Links",        field: "links"   },
]
```

`VIEW_DEFAULT_NAME = "default"` is always injected on file load and cannot be removed.

### Switching named views

The *View* tab of the MenuBar contains a `<select>` that lists all available named views. Selecting one dispatches `appSetViewName(name)`.

### Editing named views

Column widths are updated in the session store whenever the user resizes columns (`appSetCurrentView` → `appSlice.views`). They are not saved to the file.

Adding/removing columns and creating new named views is done via the Attributes dialog, which writes to `fileSlice.views` (persisted).

---

## Relevant files

- `src/frontend/View.tsx` – content mode switch
- `src/frontend/constants/view_constants.ts` – mode constants and `VIEW_DEFAULT`
- `src/frontend/store/appSlice.ts` – `contentMode`, `viewName`, `views`, `appSetCurrentView`, `appSetViewName`, `selectAppCurrentView`
- `src/frontend/store/fileSlice.ts` – `fileUpdateViews`
- `src/frontend/views/RawStoreView.tsx`, `RawFileView.tsx`, `RegIfView.tsx`
