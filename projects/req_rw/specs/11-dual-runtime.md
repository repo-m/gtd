# Feature: Dual Runtime (Desktop / Web)

Req.rw runs in two modes without any code branching in most components. The switch is resolved at runtime by a single config module, and the API layer encapsulates all mode-specific behaviour.

---

## Detection

`src/frontend/config.ts` exports:

```ts
export const isWeb = typeof window.pywebview === 'undefined';
```

`src/frontend/api/api.ts` imports `isWeb` and selects the correct API class at module load time. No build-time macro or bundler involvement.

---

## API abstraction

`src/frontend/api/api.ts`:

```ts
export const api = isWeb ? new WebApi() : new PythonApi();
```

Both classes extend `BaseApi` and expose the same interface: `init()`, `new()`, `open()`, `save()`, `saveAs()`, `copy()`, `cut()`, `paste()`.

| Method | PythonApi (desktop) | WebApi (browser) |
|--------|--------------------|--------------------|
| `init()` | Waits for `pywebviewready` event, calls `pywebview.api.getState()`, auto-loads file if filepath provided | Loads the bundled demo `.rq` spec file |
| `new()` | Dispatches `fileInit` with empty state inline; replaces current window's document | Resets state to `getNewFileState()` inline |
| `open()` | REST → OS open dialog → reads file → dispatches `fileInit` into current window | Hidden `<input type="file">` click |
| `save()` | REST → writes file to disk | Creates `data:` URI download |
| `saveAs()` | REST → OS save dialog → write | Not implemented (falls back to save) |

All methods return `{ ok: boolean; data?: T; error?: string }`. On failure, callers dispatch `appSetError(error)`.

---

## Desktop mode

Started with:
```sh
uv run src/backend/req.py [--debug] [--dev] [filepath]
```

The Python backend (`app.py`) serves the bundled frontend from `build/parcel/dev/` and exposes a REST API on port 9876 using Python's stdlib `http.server`. pywebview opens a native OS window pointing to `http://localhost:9876`.

Each window gets a unique UUID. The window object exposes `getState()` (via `window.expose`) which returns `{ id, filepath }` to the frontend. The frontend uses `id` in all REST API paths: `/window/<id>/api/...`.

Opening a file or creating a new document always replaces the content of the current window. There is no multi-window-per-document model.

---

## Web mode

Started with:
```sh
npm run web
# or
npx parcel serve --target web ...
```

No Python backend. The Parcel dev server serves the frontend. The app loads a bundled demo file (`/spec/spec_lastenheft_req.rq`) on startup via a dynamic import. File open/save use browser File API only.

Clipboard detection (`onBlur`/`onFocus` listener) is disabled in web mode to avoid permission prompts.

---

## Build targets

`package.json` defines three Parcel targets:

| Target | Optimised | Source maps | Used for |
|--------|-----------|-------------|----------|
| `dev` | No | Yes | Desktop development (HMR watch) |
| `web` | No | Yes | Browser development |
| `release` | Yes | No | Production desktop build |

Output is always to `build/parcel/<target>/`.

---

## Relevant files

- `src/frontend/config.ts` – `isWeb` export
- `src/frontend/api/api.ts` – API selector
- `src/frontend/api/baseApi.ts` – shared logic
- `src/frontend/api/pythonApi.ts` – desktop implementation
- `src/frontend/api/webApi.ts` – browser implementation
- `src/backend/gui.py` – pywebview window management
- `src/backend/app.py` – stdlib HTTP server
- `scripts/start.sh` – startup script for both modes
