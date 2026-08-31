import { configureStore } from '@reduxjs/toolkit';
import appReducer, { selectAppIsDirty } from '../../src/frontend/store/appSlice';
import fileReducer, {
  fileInit,
  fileCreateNextReq,
  fileSave,
  fileSaveAs,
} from '../../src/frontend/store/fileSlice';
import { getNewFileState } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

describe('isDirty — S3', () => {
  test('initial state is false', () => {
    const store = makeStore();
    expect(selectAppIsDirty(store.getState() as any)).toBe(false);
  });

  test('set to true after a mutating fileSlice action', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const rootId = store.getState().file.present.root;
    store.dispatch(fileCreateNextReq(rootId ?? undefined));
    expect(selectAppIsDirty(store.getState() as any)).toBe(true);
  });

  test('cleared to false after fileInit', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const rootId = store.getState().file.present.root;
    store.dispatch(fileCreateNextReq(rootId ?? undefined));
    expect(selectAppIsDirty(store.getState() as any)).toBe(true);
    store.dispatch(fileInit(getNewFileState()));
    expect(selectAppIsDirty(store.getState() as any)).toBe(false);
  });

  test('cleared to false after fileSave', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const rootId = store.getState().file.present.root;
    store.dispatch(fileCreateNextReq(rootId ?? undefined));
    expect(selectAppIsDirty(store.getState() as any)).toBe(true);
    store.dispatch(fileSave());
    expect(selectAppIsDirty(store.getState() as any)).toBe(false);
  });

  test('cleared to false after fileSaveAs', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const rootId = store.getState().file.present.root;
    store.dispatch(fileCreateNextReq(rootId ?? undefined));
    expect(selectAppIsDirty(store.getState() as any)).toBe(true);
    store.dispatch(fileSaveAs());
    expect(selectAppIsDirty(store.getState() as any)).toBe(false);
  });
});
