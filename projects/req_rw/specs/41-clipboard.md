# Feature: Clipboard

The clipboard system has two separate concerns: an internal clipboard for lossless in-document copy/paste, and an OS clipboard bridge for cross-app interop.

---

## Internal clipboard (within the same document)

`appSlice.clipboard` stores `{ reqId: number; operation: 'copy' | 'cut' }`.

### Copy (`api.copy(id, subtree)`)

1. Dispatches `appUpdateClipboard({ reqId: id, operation: 'copy' })`.
2. As a side effect, writes a YAML representation to the OS clipboard (see OS bridge below).

`subtree = true` includes the requirement and all its descendants. `subtree = false` copies only the single node (children excluded).

### Cut (`api.cut(id)`)

1. Dispatches `appUpdateClipboard({ reqId: id, operation: 'cut' })`.
2. Does **not** delete the requirement yet — deletion happens at paste time.
3. Always includes the full subtree.
4. Also writes to the OS clipboard.

### Paste (`api.paste(id, asChild)`)

1. Reads `appSlice.clipboard`.
2. If `operation === 'cut'`: removes the source req from its current position, then inserts it at the new position with ids preserved (move semantics).
3. If `operation === 'copy'`: clones the sub-tree, assigning new ids.
4. Dispatches `fileImportNextReq` or `fileImportChildReq` depending on `asChild`.

---

## OS clipboard bridge (cross-app interop)

`BaseApi` writes a plain-text YAML representation to `navigator.clipboard` as a side effect of every copy/cut. The format is a minimal `.rq` YAML fragment prefixed with an identifying comment:

```
#user-agent: Req.rw/<version> (<APP_IDENTIFIER>) [copy|cut]
root: <id>
requirements:
  ...
```

On paste when `appSlice.clipboard` is empty or the source document differs:

1. Reads `navigator.clipboard`.
2. Checks the `#user-agent:` line for the `APP_IDENTIFIER`. Cross-instance paste from a different Req.rw document is blocked with an error dispatched via `appSetError`.
3. Parses the YAML fragment with `yamlToJson → fileToState`.
4. Assigns new ids (`merge = false`).
5. Dispatches `fileImportNextReq` or `fileImportChildReq`.

### Clipboard state sync

On window focus, `BaseApi.checkClipboard()` reads the OS clipboard and updates `appSlice.clipboard.type`. This lets the UI correctly enable/disable Paste buttons even if the clipboard was modified externally.

---

## Sub-file serialisation (`storeToSubFile`)

`src/frontend/store/file.ts`

Builds a minimal `.rq`-shaped object containing only the ids in the sub-tree:
- `root` is set to `id` (the root of the copied sub-tree)
- `children` arrays are filtered to exclude ids outside the sub-tree
- Only fields that appear in the selected requirements are included

---

## Clipboard MIME type

The internal MIME type constant is `APP_MIMETYPE_TEXT_REQ = "application/x-req"` (from `app_constants.ts`). Stored in Redux state only; the actual clipboard item is `text/plain`.

---

## Relevant files

- `src/frontend/api/baseApi.ts` – copy, cut, paste, checkClipboard
- `src/frontend/api/clipboard.ts` – thin wrappers around `navigator.clipboard`
- `src/frontend/store/file.ts` – `storeToSubFile`
- `src/frontend/store/appSlice.ts` – `appUpdateClipboard`, `selectAppClipboard`
- `src/frontend/store/fileSlice.ts` – `fileImportNextReq`, `fileImportChildReq`
- `src/frontend/constants/app_constants.ts` – `APP_MIMETYPE_TEXT_REQ`, `APP_IDENTIFIER`
