---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Workspace Preferences

Req.rw stores user-specific state (last opened file, view configuration) in a preferences store that is separate from `.rq` files. This follows the same model as VS Code: documents are pure data; personal state lives outside them and is never committed alongside source files.

---

## Storage locations

| Mode | Location |
|------|----------|
| Desktop | `~/.req_rw/prefs.json` — JSON file, created on first write |
| Web | `localStorage` key `req_rw.prefs` — JSON string |

Both use the same JSON schema. Unknown top-level keys are preserved on write (forward-compatible).

---

## Schema

```json
{
  "last_filepath": "/absolute/path/to/file.rq",
  "file_state": {
    "/absolute/path/to/file.rq": {
      "active_view": "default",
      "views": {
        "default": [
          { "field": "id",      "label": "ID",           "width": 80  },
          { "field": "content", "label": "Requirements"               },
          { "field": "links",   "label": "Links",        "width": 120 }
        ]
      }
    }
  }
}
```

### `last_filepath`

Absolute path of the last successfully opened or saved file (desktop only). See `12-session-restore.md`.

### `file_state`

A map from file key → `FileViewState`:

```ts
interface FileViewState {
  active_view: string;            // name of the active named view
  views: Record<string, ViewColumn[]>;  // named view configs
}

interface ViewColumn {
  field: string;
  label: string;
  width?: number;   // absent = fill remaining space
}
```

**Key used in `file_state`:**

| Mode | Key |
|------|-----|
| Desktop | Absolute filepath (e.g. `/home/user/myspec.rq`) |
| Web | The file's `identifier` UUID from the `.rq` root — used because the browser does not expose absolute paths |

A missing or stale entry (e.g. file moved or renamed) is silently treated as "no saved state" — the app falls back to `VIEW_DEFAULT`.

---

## Backend API (desktop)

New HTTP endpoints in `app.py`:

| Method | Route | Body / Response |
|--------|-------|-----------------|
| `GET` | `/window/<id>/api/prefs` | Returns full prefs JSON object |
| `POST` | `/window/<id>/api/prefs` | `{ file_state: { [key]: FileViewState } }` — deep-merges into prefs and writes |

The POST handler performs a deep merge: it updates only the provided `file_state` keys, leaving other keys (including `last_filepath` and other `file_state` entries) untouched.

`last_filepath` is always written by the file operation handlers, not by the prefs endpoint. See `12-session-restore.md`.

`prefs.py` (already exists) is unchanged — `read() → dict` and `write(data: dict) → None`. The deep merge logic lives in the route handler.

---

## Frontend API

`BaseApi` gains two methods:

| Method | Desktop impl | Web impl |
|--------|-------------|---------|
| `getPrefs() → Promise<ApiResult<Prefs>>` | `GET /window/<id>/api/prefs` | `JSON.parse(localStorage.getItem('req_rw.prefs') ?? '{}')` |
| `saveFileState(key: string, state: FileViewState) → Promise<ApiResult<void>>` | `POST /window/<id>/api/prefs` with `{ file_state: { [key]: state } }` | Deep-merge into localStorage and write |

Both follow the standard `{ ok, data?, error? }` return contract. Failures are silently ignored at the call site (prefs are best-effort).

---

## File state lifecycle

### On file open

After `fileInit` is dispatched (file data loaded into Redux):

1. Call `api.getPrefs()`
2. Compute the file key (filepath on desktop; `fileSlice.present.identifier` on web)
3. Look up `prefs.file_state[key]`
4. If found: dispatch `appLoadFileState({ viewName: entry.active_view, views: entry.views })`
5. If not found: `appSlice` keeps defaults (`viewName = null`, `views = {}`) — `VIEW_DEFAULT` is used automatically by the selector

### On column resize

`useColumnResize` fires `appSetCurrentView` on mouse-up (once per drag, not per pixel). The caller also calls `api.saveFileState(key, currentFileViewState)` at that point.

### On named view switch

`appSetViewName` dispatches the name change. The caller also calls `api.saveFileState(key, ...)` with the updated `active_view`.

### On named view add / remove / edit

Dispatches the appropriate `appSlice` action and calls `api.saveFileState(key, ...)`.

### On app quit

No special flush — all writes happen at the moment of change.

---

## Relevant files

- `app/src/backend/prefs.py` — existing; unchanged
- `app/src/backend/app.py` — add `GET /api/prefs` and `POST /api/prefs` routes
- `app/src/frontend/api/baseApi.ts` — add `getPrefs`, `saveFileState`
- `app/src/frontend/api/pythonApi.ts` — desktop implementations of both
- `app/src/frontend/api/webApi.ts` — localStorage implementations of both
- `app/src/frontend/store/appSlice.ts` — add `appLoadFileState` action

## Related specs

- `12-session-restore.md` — `last_filepath` field; session restore flow on startup
- `33-views.md` — view configuration structure and `appSlice` integration