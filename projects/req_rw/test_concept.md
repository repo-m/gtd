# Test Strategy — Req.rw

## Philosophy

Tests are **back-pressure** on the agent loop (Huntley). They are the binary gate that replaces human verification in `loop.sh`. A test must be:

- **Deterministic** — same input, same result, always
- **Fast** — the gate must not add more than ~10s to the loop
- **Spec-derived** — every test traces back to a named spec requirement; nothing is invented

---

## What we do NOT test

| Layer | Why |
|---|---|
| Visual layout, CSS, pixel rendering | Not deterministic; belongs to manual QA |
| Drag-and-drop interactions | E2E cost outweighs value at this stage |
| OS dialogs (pywebview) | Side-effectful; tested at integration level via mock |
| React component snapshots | Brittle; break on cosmetic changes, not bugs |

---

## Test layers (ordered by priority)

### Layer 1 — Pure functions (highest priority, no setup required)

These are plain TypeScript/Python functions with no side effects. Test them first — they cover the most critical spec claims.

| Module | File | Spec |
|---|---|---|
| Serialisation pipeline | `src/frontend/store/file.ts` | `10-file-management` |
| Tree CRUD helpers | `src/frontend/store/fileSlice.ts` | `20-requirement-tree` |
| `updateMeta()` / `selectFileReqList` | `src/frontend/store/fileSlice.ts` / `fileSliceMemoSelector.ts` | `20-requirement-tree` |
| Link format + `selectFileLinkset` | `src/frontend/store/fileSlice.ts` | `40-links` |
| Search text matching | `src/frontend/store/searchMiddleware.ts` | `32-search` |
| Backend file read/write | `src/backend/files.py` | `10-file-management` |

**Tooling:** Jest (TypeScript), pytest (Python)

---

### Layer 2 — Redux store integration (medium priority)

Dispatch sequences against a real Redux store (no mocks). Validates that reducers, middleware, and selectors interact correctly.

| Scenario | Spec |
|---|---|
| `fileInit` → query selectors → correct shape | `10-file-management` |
| Create / delete / reorder reqs → `selectFileReqList` order | `20-requirement-tree` |
| Undoable reducers → `fileUndo` restores prior state | `23-undo-redo` |
| `fileUndo` at limit (100 steps) → oldest step dropped | `23-undo-redo` |
| `searchSetValue` → middleware → `searchSetResults` | `32-search` |
| `fileInit` resets undo history | `23-undo-redo` |
| `appSetFocus` after `fileDeleteReq` → stale focus handled | `23-undo-redo` |

**Tooling:** Jest + `@reduxjs/toolkit` store factory (no mocks needed — real reducers)

---

### Layer 3 — Serialisation round-trip (medium priority)

A `.rq` YAML fixture written to disk must survive a full parse → state → serialise → parse cycle unchanged (apart from fields stripped by `stateToFile`).

| Scenario | Spec |
|---|---|
| Round-trip: `yamlToJson → fileToState → stateToFile → jsonToYaml → yamlToJson` produces equivalent state | `10-file-management` |
| Missing `identifier` on load → UUID is assigned | `10-file-management` |
| `next` always equals `max + 1` after any mutation | `10-file-management` |
| Internal fields (`level`, `num`) absent from serialised YAML | `10-file-management` |
| `requirements` list sorted by id on write | `10-file-management` |

**Tooling:** Jest, with `.rq` fixture files in `tests/fixtures/`

---

### Layer 4 — Structural / architectural gate (low cost, high value)

Machine-enforceable rules derived from `specs/00-system-architecture.md`. These fail fast if the agent violates a boundary.

| Rule | How enforced |
|---|---|
| `config.ts` exports only `isWeb` | `grep`-based lint or Jest import test |
| `PythonApi` and `WebApi` both extend `BaseApi` | TypeScript compiler (tsc --noEmit) |
| No direct `fetch()` calls outside `api/` directory | ESLint `no-restricted-syntax` rule |
| No `pywebview` references in frontend code outside `config.ts` | ESLint rule |
| Python backend: no imports from `src/frontend/` | pytest + `importlib` or grep |

**Tooling:** ESLint custom rules + `tsc --noEmit` + grep assertions in a small pytest file

---

## Gate command (used in `loop.sh`)

```bash
npm test && python -m pytest tests/
```

Both must exit 0 for the loop to advance. Either failure pipes the full stderr back to the agent as the next prompt.

---

## File layout for tests

```
tests/
  fixtures/
    minimal.rq          # smallest valid .rq file
    full.rq             # document exercising all fields
  frontend/
    serialisation.test.ts
    requirementTree.test.ts
    undoRedo.test.ts
    search.test.ts
    links.test.ts
  backend/
    test_files.py
    test_arch.py        # structural/grep assertions
```

---

## Generation order (agent task sequence)

1. Generate `tests/fixtures/minimal.rq` and `full.rq` from spec `10-file-management`
2. Generate `tests/frontend/serialisation.test.ts` (Layer 1 + 3)
3. Generate `tests/frontend/requirementTree.test.ts` (Layer 1 + 2)
4. Generate `tests/frontend/undoRedo.test.ts` (Layer 2)
5. Generate `tests/frontend/search.test.ts` (Layer 1 + 2)
6. Generate `tests/frontend/links.test.ts` (Layer 1)
7. Generate `tests/backend/test_files.py` (Layer 1)
8. Generate `tests/backend/test_arch.py` (Layer 4)
9. Wire `npm test` and `pytest` into `loop.sh` gate

Each step is a separate loop iteration. The gate runs after each step.
