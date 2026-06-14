# Bug Report: 41-clipboard.md
Date: 2026-06-09
Status: FIXED

## Summary
The core copy/cut/paste mechanics are in place but six deviations from the spec were found: the clipboard YAML header uses the document UUID instead of `APP_IDENTIFIER`, cross-instance paste blocking via `appSetError` is missing, the OS-paste path bypasses `fileToState`, `WebApi` never registers a window-focus handler for `checkClipboard`, `storeToSubFile` includes all document fields rather than only those in the sub-tree, and the spec-named `fileImportNextReq`/`fileImportChildReq` actions don't exist.

## Bugs

### Bug 1: Clipboard header writes document UUID instead of `APP_IDENTIFIER`
- **Location:** `src/frontend/api/BaseApi.ts:166`
- **Issue:** `_subFileToClipboardText` uses `docId = store.getState().file.present.identifier` (a per-document UUID) in the `#user-agent:` line instead of the fixed constant `APP_IDENTIFIER = 'req-rw'`.
- **Expected:** Spec § "OS clipboard bridge" specifies the format as `#user-agent: Req.rw/<version> (<APP_IDENTIFIER>) [copy|cut]`. The value in parentheses must be `APP_IDENTIFIER` so that any Req.rw instance can recognise the header.
- **Status:** FIXED

### Bug 2: Cross-instance paste blocking not implemented
- **Location:** `src/frontend/api/BaseApi.ts:114-151` (`_pasteFromOsClipboard`)
- **Issue:** The method captures the parenthesised token from the `#user-agent:` header (regex group 1) but never compares it to `APP_IDENTIFIER` and never dispatches `appSetError`. Paste from a different Req.rw document proceeds silently.
- **Expected:** Spec: "Checks the `#user-agent:` line for the `APP_IDENTIFIER`. Cross-instance paste from a different Req.rw document is blocked with an error dispatched via `appSetError`."
- **Status:** FIXED

### Bug 3: OS-clipboard paste does not call `fileToState`
- **Location:** `src/frontend/api/BaseApi.ts:124-146` (`_pasteFromOsClipboard`)
- **Issue:** The method builds `FileState` inline, copying `identifier`, `prefix`, `max`, `next` from the *current* document rather than parsing them from the clipboard YAML. `fileToState` is never called.
- **Expected:** Spec: "Parses the YAML fragment with `yamlToJson → fileToState`." Using `fileToState` ensures consistent defaults and normalisations are applied to the pasted content.
- **Status:** FIXED

### Bug 4: `checkClipboard()` not wired to window focus in `WebApi`
- **Location:** `src/frontend/api/WebApi.ts` (no focus listener; compare `PythonApi.ts:15`)
- **Issue:** `PythonApi.init()` registers `window.addEventListener('focus', () => this.checkClipboard())`, but `WebApi.init()` does not. Paste-button state is therefore never refreshed on window focus in browser mode.
- **Expected:** Spec: "On window focus, `BaseApi.checkClipboard()` reads the OS clipboard and updates `appSlice.clipboard`…" — no restriction to desktop mode.
- **Status:** FIXED

### Bug 5: `storeToSubFile` includes all document fields, not just those present in the sub-tree
- **Location:** `src/frontend/store/file.ts:143`
- **Issue:** `storeToSubFile` returns `fields: state.fields`, which is the full document field list regardless of which fields actually appear in the copied requirements.
- **Expected:** Spec § "Sub-file serialisation": "Only fields that appear in the selected requirements are included."
- **Status:** FIXED

### Bug 6: `fileImportNextReq` / `fileImportChildReq` actions do not exist
- **Location:** `src/frontend/store/fileSlice.ts` (missing actions); `src/frontend/api/BaseApi.ts:108,110` (uses `fileImportReq` instead)
- **Issue:** Paste dispatches `fileImportReq({ importState, targetId, asChild, merge })`, a single combined action. The spec-specified actions `fileImportNextReq` and `fileImportChildReq` are nowhere defined or exported.
- **Expected:** Spec § "Paste": "Dispatches `fileImportNextReq` or `fileImportChildReq` depending on `asChild`." Spec also lists them as the action names in the relevant-files section for `fileSlice.ts`.
- **Status:** FIXED

### Bug 7: `APP_MIMETYPE_TEXT_REQ` is defined but never used
- **Location:** `src/frontend/constants/app_constants.ts:1` (defined); nowhere else imported or used
- **Issue:** The constant is declared but neither stored in Redux clipboard state nor referenced anywhere in the clipboard implementation.
- **Expected:** Spec § "Clipboard MIME type": "`APP_MIMETYPE_TEXT_REQ = 'application/x-req'` … Stored in Redux state only." The constant should appear in `ClipboardState` or otherwise be referenced as specified.
- **Status:** FIXED

### Bug 8: `src/frontend/api/clipboard.ts` file missing
- **Location:** file unknown
- **Issue:** The spec lists `src/frontend/api/clipboard.ts` as a dedicated module providing "thin wrappers around `navigator.clipboard`". This file does not exist; `navigator.clipboard` calls are inlined directly in `BaseApi.ts`.
- **Expected:** Spec § "Relevant files" designates `clipboard.ts` as the abstraction layer for OS clipboard I/O.
- **Status:** FIXED
