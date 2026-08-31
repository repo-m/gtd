import { configureStore } from '@reduxjs/toolkit';
import fileReducer, {
  fileInit,
  fileCreateNextReq,
  fileUpdateReq,
  fileUndo,
  fileRedo,
  selectFileCanUndo,
  selectFileCanRedo,
} from '../../src/frontend/store/fileSlice';
import { getNewFileState } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { file: fileReducer } });
}

type Store = ReturnType<typeof makeStore>;

/** The full history envelope: { past, present, future, paused } (see history-adapter). */
function fileState(store: Store): any {
  return (store.getState() as any).file;
}

function present(store: Store): any {
  return fileState(store).present;
}

function canUndo(store: Store): boolean {
  return selectFileCanUndo(store.getState() as any);
}

function canRedo(store: Store): boolean {
  return selectFileCanRedo(store.getState() as any);
}

describe('fileInit — resets undo history', () => {
  test('past and future are empty right after fileInit', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));

    expect(fileState(store).past).toEqual([]);
    expect(fileState(store).future).toEqual([]);
    expect(canUndo(store)).toBe(false);
    expect(canRedo(store)).toBe(false);
  });

  test('re-dispatching fileInit clears history accumulated from prior mutations', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    store.dispatch(fileUndo());
    // sanity: there is history to clear at this point
    expect(fileState(store).future.length).toBeGreaterThan(0);

    store.dispatch(fileInit(getNewFileState()));

    expect(fileState(store).past).toEqual([]);
    expect(fileState(store).future).toEqual([]);
    expect(canUndo(store)).toBe(false);
    expect(canRedo(store)).toBe(false);
  });
});

describe('fileUndo / fileRedo — undoable mutation round trip', () => {
  test('fileUndo restores the exact prior state after fileCreateNextReq', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const beforeState = present(store);

    store.dispatch(fileCreateNextReq(1));
    expect(present(store)).not.toEqual(beforeState);

    store.dispatch(fileUndo());
    expect(present(store)).toEqual(beforeState);
  });

  test('fileRedo re-applies the mutation undone by fileUndo', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    const afterMutation = present(store);

    store.dispatch(fileUndo());
    store.dispatch(fileRedo());

    expect(present(store)).toEqual(afterMutation);
  });

  test('fileUpdateReq (field edit) is also undoable', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const beforeState = present(store);

    store.dispatch(fileUpdateReq({ id: 1, field: 'text', value: 'changed' }));
    expect(present(store).requirements[1].text).toBe('changed');

    store.dispatch(fileUndo());
    expect(present(store)).toEqual(beforeState);
  });
});

describe('selectFileCanUndo / selectFileCanRedo', () => {
  test('both false immediately after fileInit', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));

    expect(canUndo(store)).toBe(false);
    expect(canRedo(store)).toBe(false);
  });

  test('canUndo becomes true after a mutation; canRedo stays false', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));

    expect(canUndo(store)).toBe(true);
    expect(canRedo(store)).toBe(false);
  });

  test('after undo: canUndo flips to false, canRedo flips to true', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    store.dispatch(fileUndo());

    expect(canUndo(store)).toBe(false);
    expect(canRedo(store)).toBe(true);
  });

  test('after redo: canUndo flips back to true, canRedo flips back to false', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    store.dispatch(fileUndo());
    store.dispatch(fileRedo());

    expect(canUndo(store)).toBe(true);
    expect(canRedo(store)).toBe(false);
  });

  test('a new mutation after undo clears future (redo no longer available)', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    store.dispatch(fileUndo());
    expect(canRedo(store)).toBe(true);

    store.dispatch(fileCreateNextReq(1));

    expect(canRedo(store)).toBe(false);
    expect(fileState(store).future).toEqual([]);
  });
});

describe('history step limit (spec 23: createHistoryAdapter({ limit: 100 }))', () => {
  test('past holds exactly N entries for N <= 100 mutations, and undoing all N returns to the original state', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const initialState = present(store);

    for (let i = 0; i < 100; i++) {
      store.dispatch(fileCreateNextReq(undefined));
    }
    expect(fileState(store).past.length).toBe(100);

    for (let i = 0; i < 100; i++) {
      store.dispatch(fileUndo());
    }
    expect(present(store)).toEqual(initialState);
    expect(canUndo(store)).toBe(false);
  });

  test('past never grows past 100 entries — the oldest step is dropped once the limit is exceeded', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));

    // First mutation: its "before" snapshot is the one that will eventually be
    // dropped once a 101st mutation pushes the history past the 100-entry limit.
    store.dispatch(fileCreateNextReq(undefined));
    const stateAfterFirstMutation = present(store);

    // 100 more mutations => 101 total; the oldest past entry (pre-first-mutation
    // state) is evicted to keep past.length capped at the configured limit.
    for (let i = 0; i < 100; i++) {
      store.dispatch(fileCreateNextReq(undefined));
    }
    expect(fileState(store).past.length).toBe(100);

    // Undoing exactly `limit` times exhausts the surviving history. If the oldest
    // entry had NOT been dropped, one more undo would still be available and the
    // final state would be the true pre-first-mutation state, not this one.
    for (let i = 0; i < 100; i++) {
      store.dispatch(fileUndo());
    }
    expect(canUndo(store)).toBe(false);
    expect(present(store)).toEqual(stateAfterFirstMutation);

    // Confirms the boundary: undo is a no-op once past is empty — there is no
    // further step to recover the original pre-first-mutation state.
    const stateBeforeExtraUndo = present(store);
    store.dispatch(fileUndo());
    expect(present(store)).toEqual(stateBeforeExtraUndo);
  });
});
