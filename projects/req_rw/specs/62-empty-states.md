---
updated: 2026-08-23
implemented: 
tested: 
---

# Spec: Empty States

Empty states are first-class UI. The application never renders a blank area or a broken layout when content is absent. This spec defines what every empty surface shows.

---

## No file open

**Condition:** `appSlice.filename` is null.

This is a **fallback state**, not the normal startup experience. On desktop, `PythonApi.init()` attempts to reopen the last-used file automatically (→ `12-session-restore.md`); this panel only appears on first launch, when the last file cannot be found, or when the user explicitly closes/creates a new document. On web, the demo file is always loaded so this panel never appears via `init()`.

The main content area (where `TableView` normally renders) shows a full-panel centered empty state. The Sidebar is hidden in this state regardless of `appSlice.sidebar`.

> **API contract:** `appSlice.filename` is only set by `appSetPath`. The no-file panel is therefore only dismissed when an API method dispatches `appSetPath`. Every API path that loads or creates a file **must** dispatch `appSetPath` after `fileInit`:
>
> | Method | Expected dispatch |
> |---|---|
> | `WebApi.init()` — demo file loaded | `appSetPath({ filepath: '', filename: 'spec_lastenheft_req.rq' })` |
> | `WebApi.init()` — fallback new file | `appSetPath({ filepath: '', filename: 'new-document.rq' })` |
> | `WebApi.new()` | `appSetPath({ filepath: '', filename: 'new-document.rq' })` |
> | `WebApi.open()` | `appSetPath({ filepath: file.name, filename: file.name })` |
> | `PythonApi._load(filepath)` | `appSetPath({ filepath, filename })` ← already correct |
> | `PythonApi.new()` | `appSetPath({ filepath: '', filename: 'new-document.rq' })` |
>
> A `filepath` of `''` is intentional for in-memory or web documents — it signals "no saved path" without leaving `filename` null. `WebApi.save()` ignores `filepath` from state and always downloads via data URI.

```
┌──────────────────────────────────────────────┐
│                                              │
│              [DocumentIcon 48px]             │
│                                              │
│               No file open                  │
│                                              │
│         [Open file]   [New file]             │
│                                              │
└──────────────────────────────────────────────┘
```

- **Icon:** `DocumentIcon`, 48 × 48 px, color `var(--color-text-muted)` (see `52-iconography.md`)
- **Heading:** "No file open" — `var(--font-size-lg)`, `var(--color-text-muted)`, `var(--font-weight-normal)`
- **Buttons:** "Open file" and "New file" — standard button style; dispatch `api.open()` and `api.new()` respectively
- Vertical gap between icon and heading: `var(--space-5)`; between heading and buttons: `var(--space-4)`

---

## Empty document

**Condition:** A file is open but `selectFileReqList` returns an empty array (file has no requirements).

The table body renders a single full-width row in place of `<tbody>` content:

```
No requirements yet — double-click here or use Add Req to get started.
```

- Text color: `var(--color-text-muted)`; font size: `var(--font-size-md)`
- Row is centered vertically within a minimum height of 120px
- Double-clicking the row dispatches `fileCreateNextReq` on the virtual root id

---

## Empty sidebar

**Condition:** The sidebar is visible and the requirement tree has no nodes.

```
No requirements
```

- Text color: `var(--color-text-muted)`; font size: `var(--font-size-sm)`
- Centered vertically and horizontally within the sidebar panel

---

## No search results

**Condition:** `searchSlice.isVisible` is true, `searchSlice.value` is non-empty, and `searchSlice.count === 0`.

- The search result counter in the search row shows `0/0`.
- A note reading `"No matches"` appears inline to the right of the counter in `var(--color-text-muted)`, `var(--font-size-xs)`.
- The table remains visible with no highlight marks — no additional empty state is shown in the table body.

---

## Relevant files

- `app/src/frontend/views/TableView/TableView.tsx` — empty document state (empty `<tbody>` row) and no-file state
- `app/src/frontend/components/SideBar/ReqTree.tsx` — empty sidebar state
- `app/src/frontend/components/MenuBar.tsx` — "No matches" note in search row
- `app/src/frontend/components/Icon/` — `DocumentIcon` for no-file state
- `app/src/frontend/store/appSlice.ts` — `filename` selector, `appSetPath` action
- `app/src/frontend/store/fileSliceMemoSelector.ts` — `selectFileReqList`
- `app/src/frontend/api/WebApi.ts` — must dispatch `appSetPath` in `init()`, `new()`, `open()`
- `app/src/frontend/api/PythonApi.ts` — must dispatch `appSetPath` in `new()` and `_load()`
- `app/src/frontend/Content.tsx` — gates sidebar and `View` on `filename !== null`

## Related specs

- `52-iconography.md` — `DocumentIcon` definition
- `50-theming.md` — tokens used for empty state typography and color
- `30-table-view.md` — table structure that the empty-document state sits within
- `31-sidebar.md` — sidebar structure that the empty-sidebar state sits within