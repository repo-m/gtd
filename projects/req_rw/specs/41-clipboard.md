---
updated: 2026-08-23
implemented: 2026-08-23
tested: 2026-08-23
---

# Feature: Clipboard

The clipboard system has two separate concerns: an internal clipboard for lossless in-document copy/paste, and an OS clipboard bridge for cross-app interop. Both concerns are always driven through `api.copy`/`api.cut`/`api.paste` — no call site dispatches `appUpdateClipboard` directly for a copy/cut, since that would skip the OS clipboard write.

---

## Internal clipboard (within the same document)

`appSlice.clipboard` stores `{ reqIds: number[]; operation: 'copy' | 'cut' } | null`.

Single-item operations pass `reqIds: [id]`. Bulk operations pass the full selection array. The clipboard is `null` when empty.

### Copy (`api.copy(id, subtree)`)

`id` is `number | number[]` — a single id or a full multi-selection.

1. Dispatches `appUpdateClipboard({ reqIds: <array form of id>, operation: 'copy' })`.
2. As a side effect, writes a YAML representation to the OS clipboard (see OS bridge below).

`subtree = true` includes each requirement and all its descendants. `subtree = false` copies only the given node(s) (children excluded).

Every call site that can act on a multi-selection (`useGlobalHotkeys` Ctrl+C, `useTableContextMenu`'s bulk "Copy selected (N)", `CommandPalette`'s Copy command) calls `api.copy(selection, false)` — bulk copy does not implicitly pull in descendants beyond what's explicitly selected. Single-row "Copy" / "Copy with children" context-menu actions pass `subtree` explicitly as before.

### Cut (`api.cut(id)`)

`id` is `number | number[]`.

1. Dispatches `appUpdateClipboard({ reqIds: <array form of id>, operation: 'cut' })`.
2. Does **not** delete the requirement(s) yet — deletion happens at paste time.
3. Always includes the full subtree of each id.
4. Also writes to the OS clipboard.

### Paste (`api.paste(id, asChild)`)

1. Reads `appSlice.clipboard`.
2. If `operation === 'cut'`: removes every source req in `reqIds` from its current position (each keeps its own subtree), then inserts the full set at the new position with ids preserved (move semantics).
3. If `operation === 'copy'`: clones every sub-tree in `reqIds`, assigning new ids.
4. Dispatches `fileImportNextReq` or `fileImportChildReq` depending on `asChild`, importing **all** ids in `reqIds` as siblings at the target — not just the first.

Internally this reuses the sentinel-wrapping mechanism described below: `storeToSubFile(fileState, reqIds)` already returns a sentinel-rooted `FileState` when `reqIds` has more than one entry, and `_wrapWithSentinel` is applied uniformly on top (safe — see "Sentinel double-wrap" below). `fileSlice.ts`'s `addState()` inserts every child of the sentinel root, not just the first, so this is what makes multi-item paste work.

---

## OS clipboard bridge (cross-app interop)

`BaseApi` writes a plain-text YAML representation to `navigator.clipboard` as a side effect of every copy/cut — including bulk operations. The format is a minimal `.rq` YAML fragment prefixed with an identifying comment:

```
#user-agent: Req.rw/<version> (<APP_IDENTIFIER>) [copy|cut]
root: <id>
requirements:
  ...
```

For a single id, `root` is that id, exactly as before (unchanged, byte-for-byte-compatible shape). For a multi-id copy/cut, `root` is `-1` — a synthetic sentinel requirement (`{ id: -1, children: [...] }`) baked into `requirements` alongside the real ones, so the document is still a valid single-root `.rq` fragment. `requirements` then contains every selected id (plus, for `subtree`-inclusive copies and all cuts, their descendants).

On paste when `appSlice.clipboard` is empty or the source document differs:

1. Reads `navigator.clipboard`.
2. Checks the `#user-agent:` line for the `APP_IDENTIFIER`. Cross-instance paste from a different Req.rw document is blocked with an error dispatched via `appSetError`.
3. Parses the YAML fragment with `yamlToJson → fileToState`.
4. Assigns new ids (`merge = false`).
5. Dispatches `fileImportNextReq` or `fileImportChildReq`, importing every child of the (possibly sentinel) root — recreating all items from a bulk copy/cut, not just the first.

### Sentinel double-wrap (why it's safe)

`_pasteFromInternal` calls `_wrapWithSentinel(subFile, subFile.root!)` unconditionally, even when `subFile` is already sentinel-rooted (multi-id case, `subFile.root === -1`). This does not double-nest: `_wrapWithSentinel` builds `{ [-1]: { id: -1, children: [rootId] }, ...subFile.requirements }` — since `subFile.requirements` (spread *after* the freshly-built entry) already has its own real entry at key `-1` when `subFile` was already sentineled, that real entry's object-spread key wins and overwrites the placeholder. The result is identical to `subFile` itself. This is covered by a regression test in `requirementTree.test.ts`.

### Clipboard state sync

On window focus, `BaseApi.checkClipboard()` reads the OS clipboard and updates `appSlice.clipboard.type`. This lets the UI correctly enable/disable Paste buttons even if the clipboard was modified externally. (Known limitation, out of scope for the bulk-clipboard fix: for a multi-id OS clipboard entry, `_parseClipboardHeader` currently reports `reqIds: [-1]` — the sentinel id, not the real selected ids — since it only reads the top-level `root` field. This only affects the clipboard-type sync on focus, not copy/cut/paste correctness.)

---

## Sub-file serialisation (`storeToSubFile`)

`app/src/frontend/store/file.ts`

`storeToSubFile(state, id)` accepts `id: number | number[]`. Builds a minimal `.rq`-shaped object containing only the ids in the sub-tree(s):
- For a single id: `root` is that id (unchanged from before), no sentinel is added.
- For multiple ids: `root` is the sentinel id `-1`, baked into `requirements` as `{ id: -1, children: <top-level given ids> }`. A given id that is already reachable as a descendant of another given id in the same call is excluded from the sentinel's direct `children` (it still appears in the tree, at its original depth under its selected ancestor) — this dedup is verified by a regression test.
- In both cases, `children` arrays are filtered to exclude ids outside the sub-tree(s), and only fields that appear in the selected requirements are included.

`BaseApi`'s private `_singleNodeSubFile(fileState, id)` (used for `subtree = false` copies) follows the same `number | number[]` / sentinel-for-multiple convention, but strips every included requirement's `children` instead of filtering them (no descendants are pulled in).

---

## Clipboard MIME type

The internal MIME type constant is `APP_MIMETYPE_TEXT_REQ = "application/x-req"` (from `app_constants.ts`). Stored in Redux state only; the actual clipboard item is `text/plain`.

---

## Relevant files

- `app/src/frontend/api/baseApi.ts` – copy, cut, paste, checkClipboard
- `app/src/frontend/api/clipboard.ts` – thin wrappers around `navigator.clipboard`
- `app/src/frontend/store/file.ts` – `storeToSubFile`
- `app/src/frontend/store/appSlice.ts` – `appUpdateClipboard`, `selectAppClipboard`
- `app/src/frontend/store/fileSlice.ts` – `fileImportNextReq`, `fileImportChildReq`
- `app/src/frontend/constants/app_constants.ts` – `APP_MIMETYPE_TEXT_REQ`, `APP_IDENTIFIER`