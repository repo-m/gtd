---
updated: 2026-08-23
implemented:
tested:
---

# Feature: View Editor

The View Editor lets users configure which columns appear in the table for the current document, manage named views, and control column order and labels. It is a user-preference surface — changes are saved to workspace prefs, never to the `.rq` file.

---

## Opening

Triggered from any of the following surfaces — all open the same modal (`Modal` component):

- MenuBar View tab → **Edit View** button
- The `[Edit View →]` link in the mismatch banner above the table (see `30-table-view.md`)
- The `+N fields ›` hidden-fields badge at the right of the column header row (see `30-table-view.md`)

---

## Structure

```
┌─ Modal: "Edit View" ────────────────────────────────────────┐
│  [default              ▾] [+ New]  [Rename]  [Delete]       │
│  ─────────────────────────────────────────────────────────  │
│  Columns                                       [+ Column]   │
│  ┌──────┬───────────────────────┬──────────────────────┐   │
│  │  ↑↓  │ Label                 │ Field                │[✕]│
│  │  ↑↓  │ ID                    │ id                   │[✕]│
│  │  ↑↓  │ Requirements          │ content              │[✕]│
│  │  ↑↓  │ Status                │ Status               │[✕]│
│  │  ↑↓  │ Category              │ Category             │[✕]│
│  │  ↑↓  │ Links                 │ links                │[✕]│
│  └──────┴───────────────────────┴──────────────────────┘   │
│                                                  [Close]    │
└─────────────────────────────────────────────────────────────┘
```

---

## Named view bar

The top bar shows the currently active named view. Controls:

| Control | Behaviour |
|---------|-----------|
| `<select>` | Lists all named views for the current file. Changing selection dispatches `appSetViewName` and saves `active_view` to prefs. |
| **+ New** | Prompts for a name (inline input replacing the select), creates an empty view, dispatches `appAddView(name)`, saves to prefs, and switches to the new view. |
| **Rename** | Prompts for a new name (inline input). Dispatches `appRenameView({ from, to })`, updates prefs. |
| **Delete** | Shows a confirmation prompt ("Delete view «name»?"). On confirm: dispatches `appDeleteView(name)`, removes from prefs, switches to `VIEW_DEFAULT_NAME`. Disabled when only one view exists. |

The `VIEW_DEFAULT_NAME` view (`"default"`) cannot be deleted.

---

## Column list

Displays the columns of the active named view in order. Each row:

| Control | Behaviour |
|---------|-----------|
| **↑ / ↓** arrow buttons | Move the column up or down in the list. |
| **Label** input | Inline editable. Changes the display label for the column. |
| **Field** (read-only text) | The field key this column maps to. Set at creation; not editable after. |
| **✕** button | Removes the column from the view. |

Every change (reorder, rename, remove) immediately dispatches `appSetCurrentView(columns)` and calls `api.saveFileState(key, currentFileViewState)`.

---

## Adding a column

**+ Column** opens an inline dropdown listing all fields available in the current document that are not already in the view:

- Built-in fields: `id` (label "ID"), `content` (label "Requirements"), `links` (label "Links")
- Custom fields: each entry from `fileSlice.fields`, using `field.name` as both field key and default label

Selecting a field appends a new column `{ field: name, label: name }` to the bottom of the list, dispatches `appSetCurrentView`, and saves to prefs.

If all fields are already in the view, the dropdown shows "All fields are visible."

---

## Behaviour when the document has no custom fields

The `+ Column` dropdown only shows built-in fields. The user is not blocked from opening or using the editor — they just have fewer options to add.

---

## State actions (additions to `appSlice`)

| Action | Payload | Effect |
|--------|---------|--------|
| `appAddView` | `name: string` | Adds `views[name] = { columns: [] }`, sets `viewName = name` |
| `appRenameView` | `{ from: string, to: string }` | Renames key in `views`, updates `viewName` if it was the active one |
| `appDeleteView` | `name: string` | Removes `views[name]`, sets `viewName = VIEW_DEFAULT_NAME` |

These join the existing `appSetCurrentView` and `appSetViewName` actions.

---

## Relevant files

- `app/src/frontend/views/ViewEditorView/ViewEditorView.tsx` — modal root
- `app/src/frontend/views/ViewEditorView/ColumnList.tsx` — column row list
- `app/src/frontend/views/ViewEditorView/AddColumnDropdown.tsx` — field picker dropdown
- `app/src/frontend/store/appSlice.ts` — `appAddView`, `appRenameView`, `appDeleteView`
- `app/src/frontend/api/baseApi.ts` — `saveFileState`

## Related specs

- `33-views.md` — named view state model, `VIEW_DEFAULT`, `selectAppCurrentView`
- `13-workspace-prefs.md` — persistence layer (`FileViewState`, `saveFileState`)
- `60-menubar.md` — "Edit View" button trigger in the View tab