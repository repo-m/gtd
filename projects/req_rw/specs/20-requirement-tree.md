# Feature: Requirement Tree

Requirements are stored as a flat dictionary and linked into a tree using an ordered `children` array on each requirement.

---

## Data model

```ts
interface Req {
  id: number;
  heading?: string;
  text?: string;
  links?: Link[];
  children: number[];        // ordered child req ids
  [field: string]: unknown;  // custom fields
}

interface FileState {
  root: number;              // id of the top-level sentinel req
  max: number;               // highest id ever allocated (never decremented)
  next: number;              // always max + 1; persisted so readers can allocate without scanning
  requirements: { [id: number]: Req };
  // ... fields, views, types, title, prefix
}
```

Example tree:

```
state.root = 1

req[1].children = [3, 2]
req[3].children = [5, 4]
req[2].children = []
req[5].children = []
req[4].children = []
```

Which represents:

```
1
├─ 3
│   ├─ 5
│   └─ 4
└─ 2
```

### Computed (internal) fields

After every mutation `updateMeta()` traverses the tree and assigns:

- `req.level` – depth (1 = top-level)
- `req.num` – display number: headings get `1`, `1.1`, `2`, …; entries get `0-1`, `1-1`, etc.

These are never persisted to the YAML file (`FIELD_LIST_INTERNAL` excludes them from serialisation).

### Heading vs entry

A requirement with a non-empty `heading` field is a *heading* (section). All others are *entries*. The type affects numbering and UI rendering (entries are indented under their parent heading in the table).

---

## CRUD operations

All mutations are undoable (wrapped in `fileHistoryAdapter.undoableReducer`).

### Create sibling (`fileCreateNextReq(id?)`)

Finds the parent of `id` and inserts a new blank requirement immediately after `id` in the parent's `children` array. If `id` is undefined, appends to the root's `children`. After insertion, `appSetFocus({ id: newId, field, editable: true })` is dispatched where `field` is the first editable field of the new req in the active view. This bypasses the global `editMode` toggle — the cell enters edit mode immediately regardless of whether edit mode is enabled.

### Create child (`fileCreateChildReq(id)`)

Inserts a new blank requirement as the first entry in `req[id].children`. After insertion, `appSetFocus({ id: newId, field, editable: true })` is dispatched where `field` is the first editable field of the new req in the active view. This bypasses the global `editMode` toggle — the cell enters edit mode immediately regardless of whether edit mode is enabled.

### Delete (`fileDeleteReq(id)`)

Removes `id` from its parent's `children` array. Then removes `id` and all its descendants from `requirements` (BFS traversal).

### Import / Paste

Three reducers, all undoable:

- `fileImportReq({ importState, targetId, asChild, merge? })` — generic form; `asChild` selects insert position.
- `fileImportNextReq({ importState, targetId, merge? })` — convenience wrapper; hardcodes `asChild = false` (insert as next sibling).
- `fileImportChildReq({ importState, targetId, merge? })` — convenience wrapper; hardcodes `asChild = true` (insert as first child).

When `merge = true` (cut from the same document), ids are preserved and the sub-tree moves in place; new ids are assigned when `merge = false`.

---

## Tree traversal helpers (internal, `fileSlice.ts`)

| Function | Purpose |
|----------|---------|
| `getParent(state, id)` | Finds the parent req id by scanning all `children` arrays |
| `removeReqSubtree(state, id)` | BFS delete of id and all descendants |
| `addReq(state, content?)` | Creates a new req; auto-increments `state.max` |
| `addState(state, importState, targetId, asChild, merge?)` | Splices an imported sub-tree into the current tree |

---

## Flat list for rendering

`selectFileReqList` (memoized selector in `fileSliceMemoSelector.ts`) does a DFS traversal starting from `state.root` and returns a flat ordered array of ids: `[1, 3, 5, 4, 2, …]`. The table view maps this array to rows.

---

## Relevant files

- `src/frontend/store/fileSlice.ts` – all reducers and tree helpers
- `src/frontend/store/fileSliceMemoSelector.ts` – `selectFileReqList`
- `src/frontend/constants/field_constants.ts` – `FIELD_LIST_INTERNAL`, `FIELD_LIST_DEFAULT`
