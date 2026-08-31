import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appSetSelection,
  appClearSelection,
  selectAppSelection,
  selectAppSelectionAnchor,
} from '../../src/frontend/store/appSlice';
import fileReducer, {
  fileInit,
  fileCreateNextReq,
  fileDeleteReq,
} from '../../src/frontend/store/fileSlice';
import { getNewFileState } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

describe('Multi-select reducers', () => {
  test('initial selection is empty with null anchor', () => {
    const store = makeStore();
    expect(selectAppSelection(store.getState() as any)).toEqual([]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBeNull();
  });

  test('appSetSelection replaces selection and sets anchor to last id', () => {
    const store = makeStore();
    store.dispatch(appSetSelection([1, 2, 3]));
    expect(selectAppSelection(store.getState() as any)).toEqual([1, 2, 3]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBe(3);
  });

  test('appSetSelection with empty array clears anchor', () => {
    const store = makeStore();
    store.dispatch(appSetSelection([1, 2, 3]));
    store.dispatch(appSetSelection([]));
    expect(selectAppSelection(store.getState() as any)).toEqual([]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBeNull();
  });

  test('appClearSelection empties selection and clears anchor', () => {
    const store = makeStore();
    store.dispatch(appSetSelection([4, 5, 6]));
    store.dispatch(appClearSelection());
    expect(selectAppSelection(store.getState() as any)).toEqual([]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBeNull();
  });

  test('Shift+Click range: anchor at index 0, target at index 3 → 4 ids selected', () => {
    const store = makeStore();
    const reqIds = [10, 20, 30, 40];
    // Plain click: set anchor to first id
    store.dispatch(appSetSelection([reqIds[0]]));
    const anchor = selectAppSelectionAnchor(store.getState() as any)!;
    // Shift+Click at index 3: compute range
    const anchorIdx = reqIds.indexOf(anchor);
    const targetIdx = 3;
    const range = reqIds.slice(
      Math.min(anchorIdx, targetIdx),
      Math.max(anchorIdx, targetIdx) + 1,
    );
    store.dispatch(appSetSelection(range));
    expect(selectAppSelection(store.getState() as any)).toHaveLength(4);
    expect(selectAppSelection(store.getState() as any)).toEqual([10, 20, 30, 40]);
  });

  test('Ctrl+Click toggle: clicking an id already in selection removes it', () => {
    const store = makeStore();
    store.dispatch(appSetSelection([1, 2, 3]));
    // Toggle off id 2
    const current = selectAppSelection(store.getState() as any);
    const toggled = current.filter((id) => id !== 2);
    store.dispatch(appSetSelection(toggled));
    expect(selectAppSelection(store.getState() as any)).toEqual([1, 3]);
  });

  test('Ctrl+A: appSetSelection(allIds) → selection equals full data array', () => {
    const store = makeStore();
    const allIds = [1, 2, 3, 4, 5];
    store.dispatch(appSetSelection(allIds));
    expect(selectAppSelection(store.getState() as any)).toEqual(allIds);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBe(5);
  });

  test('fileInit clears selection', () => {
    const store = makeStore();
    store.dispatch(appSetSelection([1, 2, 3]));
    store.dispatch(fileInit(getNewFileState()));
    expect(selectAppSelection(store.getState() as any)).toEqual([]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBeNull();
  });

  test('fileDeleteReq clears selection', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const rootId = (store.getState() as any).file.present.root;
    store.dispatch(fileCreateNextReq(rootId));
    // Find the newly created req id
    const reqs = (store.getState() as any).file.present.requirements;
    const newId = Object.keys(reqs)
      .map(Number)
      .find((id) => id !== rootId)!;
    // Set selection
    store.dispatch(appSetSelection([newId]));
    expect(selectAppSelection(store.getState() as any)).toEqual([newId]);
    // Delete the req → selection must clear
    store.dispatch(fileDeleteReq(newId));
    expect(selectAppSelection(store.getState() as any)).toEqual([]);
    expect(selectAppSelectionAnchor(store.getState() as any)).toBeNull();
  });
});
