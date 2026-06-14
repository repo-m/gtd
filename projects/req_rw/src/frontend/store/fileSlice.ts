import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { createHistoryAdapter } from 'history-adapter/redux';
import { FileState, Req, FieldDef, NamedViewDef, getNewFileState } from './file';
import type { RootState } from './store';

export interface FileSliceState extends FileState {
  focusReqId: number | null;
}

export const fileHistoryAdapter = createHistoryAdapter<FileSliceState>({ limit: 100 });

function getInitialState(): FileSliceState {
  return { ...getNewFileState(), focusReqId: null };
}

function getParent(state: FileSliceState, id: number): number | undefined {
  for (const req of Object.values(state.requirements)) {
    if (req.children.includes(id)) return req.id;
  }
  return undefined;
}

function removeReqSubtree(state: FileSliceState, id: number): void {
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    const req = state.requirements[current];
    if (req) {
      queue.push(...req.children);
    }
    delete state.requirements[current];
  }
}

function addReq(state: FileSliceState, content?: Partial<Omit<Req, 'id'>>): number {
  state.max += 1;
  const id = state.max;
  state.next = state.max + 1;
  state.requirements[id] = { id, children: [], ...content };
  return id;
}

function updateMeta(state: FileSliceState): void {
  function traverse(nodeId: number, level: number, parentHeadingNum: string): void {
    const node = state.requirements[nodeId];
    if (!node) return;
    let headingCount = 0;
    let entryCount = 0;
    for (const childId of node.children) {
      const child = state.requirements[childId];
      if (!child) continue;
      child.level = level;
      if (child.heading) {
        headingCount++;
        const childNum =
          parentHeadingNum === '0' ? `${headingCount}` : `${parentHeadingNum}.${headingCount}`;
        child.num = childNum;
        traverse(childId, level + 1, childNum);
      } else {
        entryCount++;
        child.num = `${parentHeadingNum}-${entryCount}`;
        traverse(childId, level + 1, parentHeadingNum);
      }
    }
  }
  traverse(state.root, 1, '0');
}

function addState(
  state: FileSliceState,
  importState: FileState,
  targetId: number,
  asChild: boolean,
  merge = false,
): void {
  const idMap = new Map<number, number>();
  for (const id of Object.keys(importState.requirements).map(Number)) {
    if (id === importState.root) continue;
    if (merge) {
      idMap.set(id, id);
    } else {
      state.max += 1;
      idMap.set(id, state.max);
    }
  }
  for (const req of Object.values(importState.requirements)) {
    if (req.id === importState.root) continue;
    const newId = idMap.get(req.id)!;
    state.requirements[newId] = {
      ...req,
      id: newId,
      children: req.children.map((c) => idMap.get(c) ?? c),
    };
  }
  const rootChildren = importState.requirements[importState.root].children.map(
    (c) => idMap.get(c) ?? c,
  );
  if (asChild) {
    state.requirements[targetId].children.unshift(...rootChildren);
  } else {
    const parentId = getParent(state, targetId) ?? state.root;
    const parent = state.requirements[parentId];
    const idx = parent.children.indexOf(targetId);
    if (idx >= 0) {
      parent.children.splice(idx + 1, 0, ...rootChildren);
    } else {
      parent.children.push(...rootChildren);
    }
  }
}

const fileSlice = createSlice({
  name: 'file',
  initialState: fileHistoryAdapter.getInitialState(getInitialState()),
  reducers: {
    fileInit(_state, action: PayloadAction<FileState>) {
      const newState: FileSliceState = { ...action.payload, focusReqId: null };
      updateMeta(newState);
      return fileHistoryAdapter.getInitialState(newState);
    },
    fileCreateNextReq: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<number | undefined>) => {
        const afterId = action.payload;
        const newId = addReq(state);
        if (afterId === undefined) {
          state.requirements[state.root].children.push(newId);
        } else {
          const parentId = getParent(state, afterId) ?? state.root;
          const parent = state.requirements[parentId];
          const idx = parent.children.indexOf(afterId);
          if (idx >= 0) {
            parent.children.splice(idx + 1, 0, newId);
          } else {
            parent.children.push(newId);
          }
        }
        updateMeta(state);
        state.focusReqId = newId;
      },
    ),
    fileCreateChildReq: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<number>) => {
        const parentId = action.payload;
        const newId = addReq(state);
        state.requirements[parentId].children.unshift(newId);
        updateMeta(state);
        state.focusReqId = newId;
      },
    ),
    fileDeleteReq: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<number>) => {
        const id = action.payload;
        if (id === state.root) return;
        const parentId = getParent(state, id);
        if (parentId !== undefined) {
          const parent = state.requirements[parentId];
          parent.children = parent.children.filter((c) => c !== id);
        }
        removeReqSubtree(state, id);
        updateMeta(state);
      },
    ),
    fileImportReq: fileHistoryAdapter.undoableReducer(
      (
        state,
        action: PayloadAction<{
          importState: FileState;
          targetId: number;
          asChild: boolean;
          merge?: boolean;
        }>,
      ) => {
        const { importState, targetId, asChild, merge } = action.payload;
        addState(state, importState, targetId, asChild, merge);
        updateMeta(state);
      },
    ),
    fileImportNextReq: fileHistoryAdapter.undoableReducer(
      (
        state,
        action: PayloadAction<{ importState: FileState; targetId: number; merge?: boolean }>,
      ) => {
        const { importState, targetId, merge } = action.payload;
        addState(state, importState, targetId, false, merge);
        updateMeta(state);
      },
    ),
    fileImportChildReq: fileHistoryAdapter.undoableReducer(
      (
        state,
        action: PayloadAction<{ importState: FileState; targetId: number; merge?: boolean }>,
      ) => {
        const { importState, targetId, merge } = action.payload;
        addState(state, importState, targetId, true, merge);
        updateMeta(state);
      },
    ),
    fileUpdatePrefix: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<string>) => {
        state.prefix = action.payload;
      },
    ),
    fileUpdateTitle: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<string>) => {
        state.title = action.payload;
      },
    ),
    fileUpdateReq: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<{ id: number; field: string; value: unknown }>) => {
        const { id, field, value } = action.payload;
        if (state.requirements[id]) {
          state.requirements[id][field] = value;
          updateMeta(state);
        }
      },
    ),
    fileUpdate: fileHistoryAdapter.undoableReducer(
      (
        state,
        action: PayloadAction<
          Partial<Pick<FileState, 'description' | 'fields' | 'types' | 'defaultView'>>
        >,
      ) => {
        Object.assign(state, action.payload);
      },
    ),
    fileUpdateViews: fileHistoryAdapter.undoableReducer(
      (state, action: PayloadAction<Record<string, NamedViewDef>>) => {
        state.views = action.payload;
      },
    ),
    fileUndo(state) {
      fileHistoryAdapter.undo(state);
    },
    fileRedo(state) {
      fileHistoryAdapter.redo(state);
    },
  },
});

export const {
  fileInit,
  fileCreateNextReq,
  fileCreateChildReq,
  fileDeleteReq,
  fileImportReq,
  fileImportNextReq,
  fileImportChildReq,
  fileUpdatePrefix,
  fileUpdateTitle,
  fileUpdateReq,
  fileUpdate,
  fileUpdateViews,
  fileUndo,
  fileRedo,
} = fileSlice.actions;

export const selectFileCanUndo = (state: RootState) => state.file.past.length > 0;
export const selectFileCanRedo = (state: RootState) => state.file.future.length > 0;

export default fileSlice.reducer;
