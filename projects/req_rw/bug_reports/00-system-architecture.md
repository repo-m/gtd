# Bug Report: 00-system-architecture.md
Date: 2026-06-09
Status: FIXED

## Summary
The overall architecture is structurally sound — runtime mode detection, API layer inheritance, Redux slices, search middleware, backend file I/O, and the component tree all match the spec. However, there are eight deviations: two broken HTTP routes (SaveAs/ExportReqIF are non-functional in desktop mode), three unimplemented or stub components (StatusBar, MenuBar, ContextMenu), one missing state field (`next`), one missing `WebApi` init behaviour (demo spec), and one incorrect clipboard fallback path.

## Bugs

### Bug 1: `dialog/file/save` GET route missing from `app.py`
- **Location:** `src/backend/app.py:51-74`
- **Issue:** `PythonApi.saveAs()` and `PythonApi.exportReqIf()` both call `GET /window/<id>/api/dialog/file/save`. The `_handle_api_get` method handles only `dialog/file/open`; all other `dialog/...` paths fall through to a 404. `dialogs.save_file_dialog()` exists but is never wired to an HTTP route.
- **Expected:** A `dialog/file/save` branch in `_handle_api_get` that calls `dialogs.save_file_dialog(window)` and returns `{ filepath }`, matching the pattern of `dialog/file/open`.
- **Status:** FIXED

### Bug 2: `/window/<id>/api/window POST` route not implemented
- **Location:** `src/backend/app.py:76-101`
- **Issue:** The spec architecture diagram explicitly lists `POST /window/<id>/api/window` as a backend route. The `do_POST` handler only handles `endpoint == 'file'` and returns 404 for `window`.
- **Expected:** A `window` POST endpoint in `_handle_api_get`/`do_POST` as specified in the component overview.
- **Status:** FIXED

### Bug 3: `StatusBar` is an unimplemented stub
- **Location:** `src/frontend/components/StatusBar.tsx:1-3`
- **Issue:** The entire component body is `return <div />;`. It renders nothing.
- **Expected:** Per spec: renders current filename, an edit-mode toggle button, navigation chevrons, and `appSlice.lastError` when non-null (clearing on the next successful action).
- **Status:** FIXED

### Bug 4: `MenuBar` is not a ribbon with two tabs
- **Location:** `src/frontend/components/MenuBar.tsx`
- **Issue:** Implemented as a flat bar with four buttons (Edit Attributes, Export ReqIF, Import ReqIF, Search) and an inline search input. There is no tab structure and most required actions are absent (new, open, save, clipboard actions, req management, view switching).
- **Expected:** Per spec: ribbon with two tabs — *File* (new/open/save/settings/help) and *Home* (clipboard/edit-req/req management/search/view).
- **Status:** FIXED

### Bug 5: `WebApi` does not load a demo spec on init
- **Location:** `src/frontend/api/WebApi.ts`
- **Issue:** `WebApi` has no `init()` override. The `BaseApi.init()` it inherits only attaches a clipboard focus listener. No demo spec is loaded when running in web mode.
- **Expected:** Per spec: WebApi "loads demo spec on init". An `init()` override that fetches or embeds a demo `.rq` file and dispatches `fileInit`.
- **Status:** FIXED

### Bug 6: `FileState` / `fileSlice` missing `next` field
- **Location:** `src/frontend/store/file.ts:31-43`
- **Issue:** The `FileState` interface and all derived state (`getNewFileState`, `fileToState`, `stateToFile`) have no `next` field. The history adapter wraps `FileSliceState` which extends `FileState` — `next` is absent throughout.
- **Expected:** Per spec: fileSlice "Contains … `max`, `next`". A `next: number` field (presumably the next available req ID) should be part of `FileState`.
- **Status:** FIXED

### Bug 7: OS clipboard paste plain-text fallback not implemented
- **Location:** `src/frontend/api/BaseApi.ts:103-110`
- **Issue:** In `_pasteFromOsClipboard`, when the clipboard text has no Req.rw header, the method calls `this.setError('Clipboard does not contain Req.rw content')` and returns. The content is discarded.
- **Expected:** Per spec: "if the clipboard contains a recognisable `.rq` fragment, it is deserialised; otherwise treated as plain text for the `text` field." A non-Req.rw clipboard string should be pasted as the `text` value of the target requirement.
- **Status:** FIXED

### Bug 8: `ContextMenu` component not implemented
- **Location:** file unknown (no file exists under `src/frontend/components/`)
- **Issue:** No `ContextMenu` component file exists anywhere in the frontend source tree.
- **Expected:** Per spec: "ContextMenu – generic context-menu system used by the table and link fields."
- **Status:** FIXED
