// Regression tests for: every API path that loads or creates a file must dispatch
// appSetPath so that appSlice.filename becomes non-null and Content.tsx stops
// showing the no-file panel.
//
// WebApi is excluded from direct import: its init() method uses import.meta.url,
// which is incompatible with the CommonJS module target in tsconfig.test.json.
// WebApi.new() and WebApi.open() are covered at the store-contract level instead.

import { configureStore } from '@reduxjs/toolkit';
import appReducer, { appSetPath } from '../../src/frontend/store/appSlice';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import { getNewFileState } from '../../src/frontend/store/file';
import { store } from '../../src/frontend/store/store';
import { PythonApi } from '../../src/frontend/api/PythonApi';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

// ─── Store contract ───────────────────────────────────────────────────────────

describe('appSlice.filename — initial state and appSetPath contract', () => {
  test('filename is null before any file operation', () => {
    const s = makeStore();
    expect(s.getState().app.filename).toBeNull();
  });

  test('fileInit alone does not set filename', () => {
    const s = makeStore();
    s.dispatch(fileInit(getNewFileState()));
    expect(s.getState().app.filename).toBeNull();
  });

  test('appSetPath with a real filepath sets filename', () => {
    const s = makeStore();
    s.dispatch(appSetPath({ filepath: '/docs/spec.rq', filename: 'spec.rq' }));
    expect(s.getState().app.filename).toBe('spec.rq');
  });

  test('appSetPath with empty filepath sets a non-null filename (new/web document)', () => {
    const s = makeStore();
    s.dispatch(appSetPath({ filepath: '', filename: 'new-document.rq' }));
    expect(s.getState().app.filename).toBe('new-document.rq');
  });

  test('fileInit followed by appSetPath leaves filename non-null', () => {
    const s = makeStore();
    s.dispatch(fileInit(getNewFileState()));
    s.dispatch(appSetPath({ filepath: '', filename: 'new-document.rq' }));
    expect(s.getState().app.filename).not.toBeNull();
  });
});

// ─── API dispatch — PythonApi ─────────────────────────────────────────────────

describe('PythonApi.new() — filename set after creating a new document', () => {
  test('filename is non-null after PythonApi.new()', () => {
    new PythonApi().new();
    expect(store.getState().app.filename).not.toBeNull();
  });

  test('filename equals new-document.rq after PythonApi.new()', () => {
    new PythonApi().new();
    expect(store.getState().app.filename).toBe('new-document.rq');
  });
});
