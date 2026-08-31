/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appUpdateClipboard,
  selectAppClipboard,
} from '../../src/frontend/store/appSlice';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import { getNewFileState, FileState, Req } from '../../src/frontend/store/file';
import { store } from '../../src/frontend/store/store';
import { PythonApi } from '../../src/frontend/api/PythonApi';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

describe('Clipboard state', () => {
  test('single-req copy sets reqIds: [id] and operation: copy', () => {
    const store = makeStore();
    store.dispatch(appUpdateClipboard({ reqIds: [42], operation: 'copy' }));
    const cb = selectAppClipboard(store.getState() as any);
    expect(cb).not.toBeNull();
    expect(cb!.reqIds).toEqual([42]);
    expect(cb!.operation).toBe('copy');
  });

  test('multi-req copy sets reqIds with all selected ids', () => {
    const store = makeStore();
    store.dispatch(appUpdateClipboard({ reqIds: [1, 2, 3], operation: 'copy' }));
    const cb = selectAppClipboard(store.getState() as any);
    expect(cb).not.toBeNull();
    expect(cb!.reqIds).toEqual([1, 2, 3]);
    expect(cb!.operation).toBe('copy');
  });

  test('multi-req cut sets reqIds with all selected ids and operation: cut', () => {
    const store = makeStore();
    store.dispatch(appUpdateClipboard({ reqIds: [10, 20], operation: 'cut' }));
    const cb = selectAppClipboard(store.getState() as any);
    expect(cb).not.toBeNull();
    expect(cb!.reqIds).toEqual([10, 20]);
    expect(cb!.operation).toBe('cut');
  });

  test('fileInit clears clipboard to null', () => {
    const store = makeStore();
    store.dispatch(appUpdateClipboard({ reqIds: [5], operation: 'copy' }));
    expect(selectAppClipboard(store.getState() as any)).not.toBeNull();
    store.dispatch(fileInit(getNewFileState()));
    expect(selectAppClipboard(store.getState() as any)).toBeNull();
  });
});

// ── Bulk clipboard — OS bridge + internal paste (uses the real app store, ──
// ── since BaseApi reads/writes `store` directly rather than an injected one) ─

function makeBulkFileState(): FileState {
  const requirements: Record<number, Req> = {
    0: { id: 0, children: [1, 2, 3, 4] },
    1: { id: 1, text: 'Req One', children: [] },
    2: { id: 2, text: 'Req Two', children: [] },
    3: { id: 3, text: 'Req Three', children: [] },
    4: { id: 4, text: 'Req Four', children: [] },
  };
  return {
    identifier: 'test-doc',
    title: 'Test',
    prefix: 'REQ',
    description: '',
    max: 4,
    next: 5,
    root: 0,
    requirements,
    fields: [],
    types: [],
  };
}

function mockOsClipboard() {
  let written = '';
  const writeText = jest.fn().mockImplementation((text: string) => {
    written = text;
    return Promise.resolve();
  });
  const readText = jest.fn().mockImplementation(() => Promise.resolve(written));
  Object.defineProperty(navigator, 'clipboard', {
    value: { writeText, readText },
    configurable: true,
  });
  return { writeText, readText, getWritten: () => written };
}

describe('Bulk OS-clipboard write (api.copy / api.cut)', () => {
  beforeEach(() => {
    store.dispatch(fileInit(makeBulkFileState()));
  });

  test('api.copy on a multi-selection writes a valid .rq YAML fragment covering every selected id', async () => {
    const clipboard = mockOsClipboard();
    const api = new PythonApi();

    const result = await api.copy([1, 2, 3], false);

    expect(result.ok).toBe(true);
    expect(clipboard.writeText).toHaveBeenCalledTimes(1);
    const text = clipboard.getWritten();
    expect(text).toMatch(/^#user-agent: Req\.rw\/\S+ \(\S+\) \[copy\]\n/);
    expect(text).toContain('id: 1');
    expect(text).toContain('id: 2');
    expect(text).toContain('id: 3');
    expect(text).not.toContain('id: 4');

    expect(selectAppClipboard(store.getState())).toEqual({ reqIds: [1, 2, 3], operation: 'copy' });
  });

  test('api.cut on a multi-selection writes a YAML fragment covering every selected id', async () => {
    const clipboard = mockOsClipboard();
    const api = new PythonApi();

    const result = await api.cut([2, 3]);

    expect(result.ok).toBe(true);
    const text = clipboard.getWritten();
    expect(text).toMatch(/\[cut\]/);
    expect(text).toContain('id: 2');
    expect(text).toContain('id: 3');
    expect(selectAppClipboard(store.getState())).toEqual({ reqIds: [2, 3], operation: 'cut' });
  });
});

describe('Bulk internal paste (Redux appSlice.clipboard, not yet round-tripped through the OS)', () => {
  beforeEach(() => {
    store.dispatch(fileInit(makeBulkFileState()));
  });

  test('pasting a bulk-copied internal clipboard creates all selected items, not just the first', async () => {
    store.dispatch(appUpdateClipboard({ reqIds: [2, 3], operation: 'copy' }));
    const api = new PythonApi();

    await api.paste(1, false); // paste as sibling right after req 1

    const state = store.getState().file.present;
    // originals are untouched (copy, not cut)
    expect(state.requirements[2]).toBeDefined();
    expect(state.requirements[3]).toBeDefined();
    // two new ids allocated beyond the original max (4)
    expect(state.max).toBe(6);
    expect(state.requirements[5]).toBeDefined();
    expect(state.requirements[6]).toBeDefined();
    const idx1 = state.requirements[0].children.indexOf(1);
    expect(state.requirements[0].children.slice(idx1 + 1, idx1 + 3)).toEqual([5, 6]);
  });

  test('pasting a bulk-cut internal clipboard moves all selected items, ids preserved', async () => {
    store.dispatch(appUpdateClipboard({ reqIds: [2, 3], operation: 'cut' }));
    const api = new PythonApi();

    await api.paste(4, true); // paste as child of req 4

    const state = store.getState().file.present;
    // no new ids allocated — move semantics (merge: true)
    expect(state.max).toBe(4);
    expect(state.requirements[0].children).toEqual([1, 4]);
    expect(state.requirements[4].children).toEqual([2, 3]);
    expect(state.requirements[2]).toBeDefined();
    expect(state.requirements[3]).toBeDefined();
  });
});

describe('Bulk OS-clipboard round-trip', () => {
  beforeEach(() => {
    store.dispatch(fileInit(makeBulkFileState()));
  });

  test('pasting OS-clipboard content produced by a bulk copy recreates all items with new ids', async () => {
    mockOsClipboard();
    const api = new PythonApi();

    await api.copy([2, 3], false);
    // Force the OS-clipboard path, as if the internal clipboard were empty
    // (e.g. a fresh document instance).
    store.dispatch(appUpdateClipboard(null));

    const result = await api.paste(1, false);

    expect(result.ok).toBe(true);
    const state = store.getState().file.present;
    expect(state.max).toBe(6);
    expect(state.requirements[5]).toBeDefined();
    expect(state.requirements[6]).toBeDefined();
    const idx1 = state.requirements[0].children.indexOf(1);
    expect(state.requirements[0].children.slice(idx1 + 1, idx1 + 3)).toEqual([5, 6]);
    // originals untouched — the OS bridge always clones with new ids
    expect(state.requirements[2]).toBeDefined();
    expect(state.requirements[3]).toBeDefined();
  });

  test('pasting OS-clipboard content produced by a bulk cut recreates all items (OS bridge always clones)', async () => {
    mockOsClipboard();
    const api = new PythonApi();

    await api.cut([2, 3]);
    store.dispatch(appUpdateClipboard(null));

    const result = await api.paste(1, false);

    expect(result.ok).toBe(true);
    const state = store.getState().file.present;
    expect(state.requirements[5]).toBeDefined();
    expect(state.requirements[6]).toBeDefined();
  });
});
