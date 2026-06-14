# Bug Report: 23-undo-redo.md
Date: 2026-06-09
Status: FIXED

## Summary
The Redux layer (history adapter, undoable reducers, `fileUndo`/`fileRedo` actions, `selectFileCanUndo`/`selectFileCanRedo` selectors, stale-focus guard in `TableCellContent`) is fully implemented. However the undo/redo buttons are entirely absent from the menu bar, meaning undo and redo are not accessible to the user.

## Bugs

### Bug 1: Undo/Redo buttons missing from MenuBar
- **Location:** `src/frontend/components/MenuBar.tsx` (entire file)
- **Issue:** `MenuBar.tsx` contains no Undo or Redo buttons. `fileUndo` and `fileRedo` are never dispatched from any UI component. `selectFileCanUndo` and `selectFileCanRedo` are never consumed. The spec-referenced files `src/frontend/components/MenuBar/menuBarData/entryDataUndo.ts` and `src/frontend/components/MenuBar/menuBarData/entryDataRedo.ts` do not exist.
- **Expected:** The menu bar (Home tab) exposes Undo and Redo buttons whose enabled/disabled state is driven by `selectFileCanUndo` and `selectFileCanRedo` respectively, and which dispatch `fileUndo` / `fileRedo` on click.
- **Status:** FIXED
