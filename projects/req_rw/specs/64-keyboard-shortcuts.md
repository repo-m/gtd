---
updated: 2026-08-23
implemented: 2026-08-23
tested: 2026-08-23
---

# Feature: Global Keyboard Shortcuts

A single `useGlobalHotkeys` hook mounted in `App.tsx` intercepts document-level `keydown` events and dispatches the matching Redux actions. It is the sole owner of all global shortcuts not already handled by Lexical or TableView gesture logic.

---

## Hook placement

```
App.tsx
  └── useGlobalHotkeys(store, api)   ← single useEffect, window keydown listener
```

The hook is called once at the top level of `App`. It must not be called inside any conditional or sub-component.

---

## Modifier normalisation

Ctrl on Windows/Linux, Cmd on macOS. Both map to the same logical modifier:

```ts
const mod = event.ctrlKey || event.metaKey;
```

No shortcut uses both modifiers simultaneously.

---

## Focus guard

Before dispatching any action, check `event.target`:

```ts
function isInputFocused(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = (target as Element).tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if ((target as Element).closest('.lexical-editor')) return true;
  return false;
}
```

If `isInputFocused` returns `true`, return immediately — do not dispatch, do not call `preventDefault`.

This ensures native text editing (including Lexical's Ctrl+B/I/U shortcuts) is never interrupted.

---

## Shortcut table

All shortcuts require the `mod` modifier. Keys are case-insensitive (`event.key` is already lowercase for letters).

| Key | Condition | Action | `preventDefault` |
|-----|-----------|--------|-----------------|
| `z` | — | `dispatch(fileUndo())` | yes |
| `y` | — | `dispatch(fileRedo())` | yes |
| `c` | `selection` non-empty | dispatch `appUpdateClipboard({ reqIds: selection, operation: 'copy' })` + write OS clipboard | no |
| `c` | `selection` empty | no-op — let browser handle | — |
| `x` | `selection` non-empty | dispatch `appUpdateClipboard({ reqIds: selection, operation: 'cut' })` + write OS clipboard | no |
| `x` | `selection` empty | no-op | — |
| `v` | `clipboard` non-null | `api.paste(focusedReqId, false)` | yes |
| `v` | `clipboard` null | no-op | — |
| `f` | — | `dispatch(searchSetVisible(true))` | yes |

`selection` is read from `selectAppSelection(store.getState())`.  
`clipboard` is read from `selectAppClipboard(store.getState())`.  
`focusedReqId` is read from `selectAppFocusReqId(store.getState())`.

For `c` and `x`, writing to the OS clipboard (via `navigator.clipboard`) follows the same path as `api.copy` / `api.cut`. The hook calls the API method that handles both the Redux dispatch and the OS clipboard write.

---

## What this hook does NOT handle

| Shortcut | Owner |
|---|---|
| Ctrl+B / Ctrl+I / Ctrl+U | Lexical editor (built-in, inside `.lexical-editor`) |
| Ctrl+Click | TableView `onClick` handler |
| Ctrl+A | TableView `onKeyDown` handler |
| Escape (close modal, cancel edit) | Individual component `onKeyDown` |
| Arrow keys (navigation) | TableView / SideBar component handlers |

---

## Relevant files

- `app/src/frontend/hooks/useGlobalHotkeys.ts` — hook implementation
- `app/src/frontend/App.tsx` — mounts the hook
- `app/src/frontend/store/appSlice.ts` — `selectAppSelection`, `selectAppClipboard`, `selectAppFocusReqId`, `fileUndo`, `fileRedo`
- `app/src/frontend/store/searchSlice.ts` — `searchSetVisible`
- `app/src/frontend/api/baseApi.ts` — `api.copy`, `api.cut`, `api.paste`

## Related specs

- `23-undo-redo.md` — `fileUndo` / `fileRedo` actions
- `41-clipboard.md` — `appUpdateClipboard`, OS clipboard bridge
- `32-search.md` — `searchSetVisible`
- `30-table-view.md` — Ctrl+Click / Ctrl+A (stays in TableView)
- `21-rich-text-editor.md` — Lexical handles Ctrl+B/I/U internally
