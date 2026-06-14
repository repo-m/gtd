# Bug Report: 11-dual-runtime.md
Date: 2026-06-09
Status: FIXED

## Summary
The core detection and routing logic is correct, but WebApi.init() loads an empty state instead of the bundled demo file, the clipboard focus listener is not suppressed in web mode, and all API methods return void rather than the `{ ok, data, error }` contract the spec defines.

## Bugs

### Bug 1: WebApi.init() loads empty state instead of bundled demo file
- **Location:** src/frontend/api/WebApi.ts:11-14
- **Issue:** `WebApi.init()` dispatches `fileInit(getNewFileState())`, creating a blank document. It does not load the bundled demo file.
- **Expected:** Spec says init() in web mode "Loads the bundled demo `.rq` spec file" (`/spec/spec_lastenheft_req.rq`) via dynamic import.
- **Status:** FIXED

### Bug 2: Clipboard detection listener not disabled in web mode
- **Location:** src/frontend/api/WebApi.ts:12 (calls `super.init()`), src/frontend/api/BaseApi.ts:19-21
- **Issue:** `WebApi.init()` calls `super.init()` which installs `window.addEventListener('focus', () => this.checkClipboard())`. This attaches the clipboard polling listener in web mode.
- **Expected:** Spec states "Clipboard detection (`onBlur`/`onFocus` listener) is disabled in web mode to avoid permission prompts." `WebApi.init()` must not install the clipboard focus listener.
- **Status:** FIXED

### Bug 3: API methods return void instead of `{ ok: boolean; data?: T; error?: string }`
- **Location:** src/frontend/api/BaseApi.ts:19-194, src/frontend/api/PythonApi.ts, src/frontend/api/WebApi.ts — all public methods
- **Issue:** Every method (`init`, `new`, `open`, `save`, `saveAs`, `copy`, `cut`, `paste`) returns `void` or `Promise<void>`. Errors are dispatched internally via `this.setError()` instead of being returned to callers.
- **Expected:** Spec defines the contract as "All methods return `{ ok: boolean; data?: T; error?: string }`. On failure, callers dispatch `appSetError(error)`." The current design inverts responsibility — the API dispatches errors itself rather than surfacing them as return values.
- **Status:** FIXED

### Bug 4: scripts/start.sh missing
- **Location:** file unknown (scripts/ directory does not exist)
- **Issue:** The spec lists `scripts/start.sh` as a relevant file ("startup script for both modes"), but neither the file nor its parent directory exists.
- **Expected:** `scripts/start.sh` should exist and provide a unified launch entry point for desktop and web modes.
- **Status:** FIXED
