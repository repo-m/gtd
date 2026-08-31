---
updated: 2026-08-23
implemented: 
tested: 
---

# System Architecture

## What it is

**Req.rw** is a desktop requirement management tool that reads and writes `.rq` files (YAML). It can also run as a pure web app in a browser. The UI is a React + TypeScript single-page application; in desktop mode a Python backend provides native OS dialogs and file I/O.

---

## Runtime modes

| Mode | Entry point | File I/O | Native dialogs |
|------|------------|----------|----------------|
| **Desktop** | `uv run app/src/backend/req.py` | Python REST API | pywebview OS dialogs |
| **Web** | `npm run web` (Parcel dev server) | Browser File API | HTML `<input type="file">` |

The frontend detects which mode it is in at runtime. `app/src/frontend/config.ts` exports:

```ts
export const isWeb = typeof window.pywebview === 'undefined';
```

`app/src/frontend/api/api.ts` imports `isWeb` and selects `PythonApi` or `WebApi` accordingly. No build-time macro or bundler involvement.

---

## Component overview

```
┌─────────────────────────────────────────────────────────┐
│  Desktop process (Python)                               │
│                                                         │
│  req.py  ──► gui.py (pywebview window)                 │
│          ──► app.py (stdlib HTTP server :9876)         │
│               ├─ /window/<id>/api/file        GET/POST  │
│               ├─ /window/<id>/api/prefs       GET/POST  │
│               ├─ /window/<id>/api/dialog/...  GET       │
│               ├─ /window/<id>/api/window      POST      │
│               └─ /<path>  (static frontend build)       │
└───────────────────────┬─────────────────────────────────┘
                        │ HTTP (localhost:9876)
┌───────────────────────▼─────────────────────────────────┐
│  Frontend (React + TypeScript SPA – built by Parcel)    │
│                                                         │
│  App.tsx                                                │
│   └─ Content.tsx                                        │
│       ├─ MenuBar        (ribbon-style two-tab toolbar)  │
│       ├─ SideBar        (collapsible req tree)          │
│       ├─ View           (switchable content area)       │
│       └─ StatusBar      (filename, edit-mode, errors)   │
│                                                         │
│  State: Redux (3 slices)                                │
│   ├─ app    – UI state (mode, focus, sidebar, …)        │
│   ├─ file   – document state + undo/redo history        │
│   └─ search – search term, results, index               │
└─────────────────────────────────────────────────────────┘
```

---

## Backend (`app/src/backend/`)

| File | Responsibility |
|------|---------------|
| `req.py` | CLI entry point; parses `--debug`/`--dev`/filepath args, creates window, starts event loop |
| `gui.py` | pywebview window management; exposes `getState()` (window id + initial filepath) to JS |
| `app.py` | stdlib HTTP routes: file read/write, OS dialog triggers, static serving |
| `files.py` | Raw UTF-8 file read/write |
| `dialogs.py` | OS-native open/save dialog wrappers (pywebview) |
| `constants.py` | `APP_NAME`, `PORT` (9876), `STATIC_DIR` path |

---

## Frontend (`app/src/frontend/`)

### API layer (`api/`)

| Class | Used when |
|-------|-----------|
| `BaseApi` | Always; provides internal clipboard logic and OS clipboard bridge |
| `PythonApi extends BaseApi` | Desktop mode; calls the stdlib HTTP REST API for file I/O and dialogs |
| `WebApi extends BaseApi` | Web mode; uses browser File API for open/save, loads demo spec on init |

Every API method returns `{ ok: boolean; data?: T; error?: string }`. Callers check `ok` and dispatch `appSetError(error)` on failure. Methods never throw.

### State management (`store/`)

| Slice | Key state |
|-------|-----------|
| `appSlice` | `editMode`, `contentMode` (TABLE/RAW/FILE/REGIF), `sidebar`, `viewName`, `views` (named view configs loaded from prefs on file open, persisted back on change), `focus` (selected cell), `clipboard` metadata, `lastError: string \| null` |
| `fileSlice` | Document data wrapped in a 100-step undo/redo history adapter. Contains `requirements` (keyed by integer id), `fields`, `types`, `title`, `prefix`, `description`, `identifier`, `max`, `next` (always `max+1`) |
| `searchSlice` | `isVisible`, `value`, `results[]`, `resultMap: { [reqId]: { [field]: CharRange[] } }` |

`searchMiddleware` in `searchMiddleware.ts` reacts to `searchSetValue` / `searchStart` by walking `state.file.requirements` and computing text matches in the data layer. Results are dispatched as `searchSetResults`. No DOM access.

### Clipboard model

`BaseApi` manages two separate clipboard concerns:

- **Internal clipboard** (copy/paste within the same document): `appSlice.clipboard` stores `{ reqId, operation: 'copy' | 'cut' }`. Paste clones the subtree in Redux, assigning new IDs. No OS clipboard involved.
- **OS clipboard bridge** (cross-app interop): `BaseApi` writes a plain-text or YAML representation to `navigator.clipboard` as a side effect of copy. On paste, if the clipboard contains a recognisable `.rq` fragment, it is deserialised; otherwise treated as plain text for the `text` field.

### Document model

A requirement file is YAML. On load it is parsed (`yamlToJson`) and transformed to Redux state (`fileToState`). On save the reverse happens: `storeToYaml` wraps `stateToFile` (drops internal fields, sorts, strips undefined) then `jsonToYaml` (YAML.stringify).

Requirements are stored as a flat dictionary `{ [id]: Req }` with an array-of-children tree:

```ts
interface Req {
  id: number;
  heading?: string;
  text?: string;
  links?: Link[];
  children: number[];   // ordered child req ids
  [field: string]: unknown;
}

interface FileState {
  root: number;         // id of the top-level sentinel req
  requirements: { [id: number]: Req };
  // ... fields, types, title, prefix, description, identifier, max, next
}
```

`level` and `num` are computed fields recalculated after every mutation by `updateMeta()`. Insert, move, and delete operations work by splicing `children` arrays — no pointer relinking required.

### View layer (`views/` + `components/`)

| View mode | Component | Notes |
|-----------|-----------|-------|
| `TABLE` | `TableView` | Default; shows requirements as resizable-column table |
| `RAW` | `RawStoreView` | JSON dump of Redux file state |
| `FILE` | `RawFileView` | YAML representation of the file |
| `REGIF` | `RegIfView` | ReqIF 1.2 import/export. `transform/ReqIF/` handles parsing and serialisation; this view is the UI surface for import/export operations. |

The **AttributesView** is a modal (not a view mode) for editing file-level settings.

### Key components

- **MenuBar** – ribbon with three tabs: *File* (new/open/save/export/attributes), *Home* (undo/redo, clipboard, formatting, req CRUD, view mode buttons, search, sidebar/edit toggles), *View* (named view selector).
- **SideBar** – collapsible panel showing the requirement tree (`ReqTree` → recursive `ReqTreeItem`). Width is user-resizable via drag.
- **StatusBar** – shows filename, edit-mode toggle button, navigation chevrons, and `appSlice.lastError` when non-null. Error clears on the next successful action.
- **RichTextEditor** – Lexical-based editor used for `text` (rich text) fields. Plugins: `RichTextPlugin` + `ListPlugin` (core editing), `ValueEffectPlugin` (sync value in), `UpdateEffectPlugin` (emit changes out), `EditModeEffectPlugin` (toggle read/write), `SearchMarkPlugin` (highlights search hits from `searchSlice.resultMap`), `ToggleEmptyClassPlugin` (placeholder visibility), `AutoFocusPlugin` (focus on edit entry).
- **ContextMenu** – generic context-menu system used by the table and link fields.
- **Modal** – generic modal dialog used by AttributesView.

### Error handling

All errors surface through a single path:

1. **API methods** return `{ ok: false, error: string }` on any failure (network error, HTTP error, parse failure). They never throw.
2. **Callers** dispatch `appSetError(error)` into `appSlice.lastError`.
3. **StatusBar** renders `lastError` when non-null.
4. **On successful action**, callers dispatch `appClearError()`.
5. **File parse failure** (`yamlToJson` / `fileToState`): return `{ ok: false, error }` without mutating `fileSlice`.

No retry logic, no error codes, no toast stacks.

### Build toolchain

| Tool | Role |
|------|------|
| Parcel 2 | Bundler; three targets: `dev` (HMR, unoptimized), `web` (browser serve), `release` (optimized) |
| TypeScript | Static typing for all frontend source |
| ESLint + Prettier | Linting and formatting |
| uv | Python dependency/virtualenv management |

SVG icons are imported as standard React components using Parcel's built-in SVG-as-React support — no custom transformer. Vendored dependencies use standard relative imports — no custom resolver.

---

## Version control

Req.rw takes a passive approach to Git. The tool only reads and writes `.rq` files; all Git operations (commit, push, pull, history, diff) are performed by the user outside the tool.

The `.rq` YAML format is designed to support this:

- One requirement per YAML block — diffs are readable and meaningful.
- No generated IDs or binary content that would produce noisy diffs.
- Merge conflicts are resolvable in any text editor.

A future active mode (in-tool commit/history/diff) is a possible extension but is out of scope for the current architecture.

---

## Data flow: open a file (desktop)

1. User clicks *Open* → `api.open()` → `GET /window/<id>/api/dialog/file/open` → OS dialog → returns filepath
2. `api.open()` calls `_load(filepath)` on the current window
3. `GET /window/<id>/api/file?filepath=…` → Python reads file → returns YAML string
4. `yamlToJson` → `fileToState` → `store.dispatch(fileInit(…))` → Redux state updated → React re-renders
5. `store.dispatch(appSetPath({ filename, filepath }))` updates status bar

Opening a file always replaces the content of the current window. There is no multi-window-per-document model.

## Data flow: save a file (desktop)

1. User clicks *Save* → `api.save()` → `store.getState()` → `storeToYaml(selectFile(state))`
2. `POST /window/<id>/api/file` with `{ filepath, content }` → Python writes file
3. `store.dispatch(appSetPath({ filename, filepath }))` updates status bar