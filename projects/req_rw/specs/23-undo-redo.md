# Feature: Undo / Redo

Every mutation to the document is undoable. The history is stored inside the `fileSlice` Redux state using the `history-adapter` library.

---

## Implementation

`createHistoryAdapter({ limit: 100 })` wraps the file state in a history envelope:

```
fileSlice state = {
  past:    [snapshot₀, snapshot₁, …],   // up to 100 entries
  present: <current file state>,
  future:  [snapshotₙ₊₁, …]
}
```

`fileHistoryAdapter.undoableReducer(reducerFn)` is used for every state-changing reducer. It pushes the current `present` to `past` before applying the change.

`fileUndo` / `fileRedo` are plain reducers that move one step back or forward in the history.

Selectors `selectFileCanUndo` and `selectFileCanRedo` expose whether there is history to traverse. These drive the enabled/disabled state of the undo/redo buttons in the menu bar.

---

## Which actions are undoable

All `fileSlice` reducers wrapped with `undoableReducer`:

- `fileUpdateViews` – column configuration changes
- `fileCreateChildReq` – add child
- `fileCreateNextReq` – add sibling
- `fileDeleteReq` – delete requirement + subtree
- `fileImportReq` / `fileImportNextReq` / `fileImportChildReq` – paste / import (next/child are convenience wrappers around the generic form)
- `fileUpdatePrefix` – change document prefix
- `fileUpdateTitle` – change document title
- `fileUpdateReq` – field edits (including rich text)
- `fileUpdate` – generic state merge

`fileInit` (load a new file) is **not** undoable — it resets history entirely with `fileHistoryAdapter.getInitialState(newState)`.

---

## Undo/Redo and focus

After undo/redo the focused cell (`appSlice.focus`) may point to a now-deleted requirement. The UI must handle stale focus gracefully; field components check that their `id` still exists in `selectFileRequirements` before rendering.

---

## Relevant files

- `src/frontend/store/fileSlice.ts` – history adapter setup, all undoable reducers
- `src/frontend/components/MenuBar/menuBarData/entryDataUndo.ts`
- `src/frontend/components/MenuBar/menuBarData/entryDataRedo.ts`
