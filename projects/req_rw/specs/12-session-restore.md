---
updated: 2026-08-23
implemented: 
tested: 
---

# Feature: Session Restore

On desktop, Req.rw reopens the last-used file automatically on startup — the user lands back in their work with no intermediary screen. The "No file open" panel (→ `62-empty-states`) is a fallback, not the default.

Web mode is out of scope: the browser always loads the bundled demo file on startup.

---

## Prefs file

The Python backend persists session state to a JSON prefs file:

- **Path:** `~/.req_rw/prefs.json` (created on first write; directory created if absent)
- **Relevant field:** `last_filepath` — absolute path of the last successfully opened/saved file

The full prefs schema (including per-file view state) is defined in `13-workspace-prefs.md`. This spec covers only the `last_filepath` field and the session restore flow.

Unknown keys are preserved on write (forward-compatible). Missing keys are treated as absent with no error.

---

## When last_filepath is updated

The Python backend updates `last_filepath` in prefs after any operation that successfully loads or writes a file:

| Operation | Trigger |
|-----------|---------|
| Open file (user chose a file via dialog) | After `files.read()` succeeds in the open handler |
| Save file | After `files.write()` succeeds in the save handler |
| Save As | After `files.write()` succeeds in the save-as handler |
| Launch with filepath arg | After `files.read()` succeeds at startup |

The update is best-effort: a write failure to the prefs file is silently ignored and does not abort the file operation.

---

## getState() extension

`gui.py` exposes `getState()` to the JS frontend via `window.expose`. The return shape is extended to include the persisted last filepath:

```python
def getState():
    return {
        "id": window_id,
        "filepath": launch_filepath or "",   # explicit CLI arg, unchanged
        "lastFilepath": prefs.read().get("last_filepath", ""),
    }
```

`filepath` (launch arg) takes priority; `lastFilepath` is only used when `filepath` is empty.

---

## PythonApi.init() flow

```
1. Wait for pywebviewready event
2. Call pywebview.api.getState() → { id, filepath, lastFilepath }
3. Store window id
4. if filepath is non-empty:
     _load(filepath)        ← explicit launch arg; error shown in StatusBar as usual
5. else if lastFilepath is non-empty:
     _load(lastFilepath)    ← session restore; on any failure → silently no-op (see below)
6. else:
     no-op                  ← first launch; "No file open" panel shown
```

On a session-restore failure (step 5): dispatch `appClearError()` rather than `appSetError()`. The user sees the "No file open" panel with no error message. The stale path is kept in prefs — the user may re-attach the storage medium later.

On a launch-arg failure (step 4): existing error-handling applies — `appSetError(error)` surfaces in the StatusBar.

---

## New backend file

| File | Responsibility |
|------|---------------|
| `app/src/backend/prefs.py` | `read() → dict`, `write(data: dict) → None`; handles missing file, missing directory, and write errors silently |

`prefs.py` is a thin wrapper — no retries, no locking, no migration logic.

---

## Relevant files

- `app/src/backend/prefs.py` — new; prefs read/write
- `app/src/backend/gui.py` — extend `getState()` to include `lastFilepath`
- `app/src/backend/app.py` — call `prefs.write({"last_filepath": filepath})` in the open, save, and save-as handlers after a successful file operation
- `app/src/frontend/api/pythonApi.ts` — update `init()` to implement the 6-step flow above

## Related specs

- `10-file-management.md` — file I/O operations that trigger prefs updates
- `11-dual-runtime.md` — `PythonApi.init()` and `getState()` contract
- `62-empty-states.md` — "No file open" panel shown as fallback