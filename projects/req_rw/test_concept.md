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
| `selectFilteredReqList` | `src/frontend/store/fileSliceMemoSelector.ts` | `35-filter` |
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
| `appSetSelection([ids])` → `state.selection` matches; anchor = last id | `30-table-view` |
| `appSetSelection` range (Shift+Click) — anchor at index 0, target at index 3 → 4 ids selected | `30-table-view` |
| `appSetSelection` toggle (Ctrl+Click) — clicking an id already in selection removes it | `30-table-view` |
| `appSetSelection(allIds)` (Ctrl+A) → selection equals full `data` array | `30-table-view` |
| `appClearSelection()` → `state.selection` is empty, anchor is null | `30-table-view` |
| `fileInit` → `selection` is cleared | `30-table-view` |
| `appUpdateClipboard({ reqIds: [1], operation: 'copy' })` → `clipboard.reqIds === [1]` | `41-clipboard` |
| `appUpdateClipboard({ reqIds: [1,2,3], operation: 'copy' })` → `clipboard.reqIds === [1,2,3]` | `41-clipboard` |
| `appUpdateClipboard({ reqIds: [1,2,3], operation: 'cut' })` → `clipboard.operation === 'cut'` | `41-clipboard` |
| `fileInit` → `clipboard` is null | `41-clipboard` |
| `handleKeyDown` with `event.target = INPUT` → nothing dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` with `event.target` inside `.lexical-editor` → nothing dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+Z → `fileUndo` dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+Y → `fileRedo` dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+F → `searchSetVisible(true)` dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+C with `selection=[1,2]` → `appUpdateClipboard({ reqIds:[1,2], operation:'copy' })` dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+C with empty selection → nothing dispatched | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+V with clipboard non-null → `api.paste` called | `64-keyboard-shortcuts` |
| `handleKeyDown` Ctrl+V with clipboard null → nothing dispatched | `64-keyboard-shortcuts` |
| `appSetFilter({ field, filter })` → `filters[field]` is set | `35-filter` |
| `appClearFilter(field)` → `filters[field]` is absent | `35-filter` |
| `appClearAllFilters()` → `filters` is `{}` | `35-filter` |
| `fileInit` → `filters` reset to `{}` | `35-filter` |
| `selectFilteredReqList` with no active filters → identical to `selectFileReqList` | `35-filter` |
| Enum filter `include: ['Open']` → hides rows where `Status !== 'Open'` | `35-filter` |
| Enum filter `include: ['']` → shows only rows with blank value for that field | `35-filter` |
| Enum filter `include: []` → returns empty list | `35-filter` |
| Text filter `value: 'foo'` → hides rows not containing `'foo'` (case-insensitive) | `35-filter` |
| Two active filters → AND-combined; row must satisfy both | `35-filter` |
| `appOpenCommandPalette()` → `commandPaletteOpen === true` | `65-command-palette` |
| `appCloseCommandPalette()` → `commandPaletteOpen === false` | `65-command-palette` |
| `fileInit` → `commandPaletteOpen` unchanged (stays false) | `65-command-palette` |
| `handleKeyDown` Ctrl+K → `appOpenCommandPalette` dispatched | `65-command-palette` |
| `filterCommands(commands, '')` → returns all non-Navigate commands | `65-command-palette` |
| `filterCommands(commands, 'undo')` → returns only commands matching 'undo' | `65-command-palette` |
| `filterCommands(commands, 'XYZ-NOMATCH')` → returns empty array | `65-command-palette` |

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
| Missing `title` on load → defaults to `''` | `10-file-management` (Validation) |
| Missing `identifier` on load → UUID is assigned (validation contract) | `10-file-management` (Validation) |
| Unknown top-level key in `.rq` → absent from loaded state | `10-file-management` (Validation) |
| `FieldDef` with unrecognised `type` value → dropped, valid entries kept | `10-file-management` (Validation) |
| `root` referencing absent id → falls back to first req id; null if requirements empty | `10-file-management` (Validation) |

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
    multiSelect.test.ts  # appSetSelection / appClearSelection reducers + fileInit clears selection
    clipboard.test.ts    # appUpdateClipboard with single/multi reqIds + fileInit clears clipboard
    globalHotkeys.test.ts  # useGlobalHotkeys handler: guard skips inputs/Lexical, each shortcut dispatches correct action, no-op cases
    filter.test.ts         # selectFilteredReqList selector + appSetFilter / appClearFilter / appClearAllFilters reducers + fileInit clears filters
    commandPalette.test.ts # appOpenCommandPalette / appCloseCommandPalette reducers + selectAppCommandPaletteOpen + filterCommands pure fn + Ctrl+K hotkey dispatch
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
10. Generate `tests/frontend/filter.test.ts` (Layer 1 + 2)
11. Generate `tests/frontend/commandPalette.test.ts` (Layer 1 + 2)

Each step is a separate loop iteration. The gate runs after each step.
