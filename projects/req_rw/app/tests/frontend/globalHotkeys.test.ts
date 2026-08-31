/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appSetSelection,
  appSetFocus,
  appUpdateClipboard,
  selectAppClipboard,
} from '../../src/frontend/store/appSlice';
import fileReducer from '../../src/frontend/store/fileSlice';
import searchReducer from '../../src/frontend/store/searchSlice';
import { isInputFocused, createKeyHandler } from '../../src/frontend/hooks/useGlobalHotkeys';

function makeStore() {
  return configureStore({
    reducer: { app: appReducer, file: fileReducer, search: searchReducer },
  });
}

function makeApi() {
  return {
    copy: jest.fn().mockResolvedValue({ ok: true }),
    cut: jest.fn().mockResolvedValue({ ok: true }),
    paste: jest.fn().mockResolvedValue({ ok: true }),
  };
}

function makeEvent(key: string, opts: { ctrlKey?: boolean; metaKey?: boolean } = { ctrlKey: true }) {
  return new KeyboardEvent('keydown', { key, bubbles: true, cancelable: true, ...opts });
}

// ── isInputFocused guard ──────────────────────────────────────────────────────

describe('isInputFocused', () => {
  test('returns true for INPUT element', () => {
    const el = document.createElement('input');
    expect(isInputFocused(el)).toBe(true);
  });

  test('returns true for TEXTAREA element', () => {
    const el = document.createElement('textarea');
    expect(isInputFocused(el)).toBe(true);
  });

  test('returns true for SELECT element', () => {
    const el = document.createElement('select');
    expect(isInputFocused(el)).toBe(true);
  });

  test('returns true for element inside .lexical-editor', () => {
    const editor = document.createElement('div');
    editor.className = 'lexical-editor';
    const inner = document.createElement('span');
    editor.appendChild(inner);
    document.body.appendChild(editor);
    expect(isInputFocused(inner)).toBe(true);
    document.body.removeChild(editor);
  });

  test('returns false for a plain div', () => {
    const el = document.createElement('div');
    expect(isInputFocused(el)).toBe(false);
  });

  test('returns false for null', () => {
    expect(isInputFocused(null)).toBe(false);
  });

  test('returns false for window (non-Element EventTarget)', () => {
    expect(isInputFocused(window)).toBe(false);
  });
});

// ── Guard integration: handler skips shortcuts when input has focus ────────────

describe('handler guard', () => {
  test('does not dispatch when target is an INPUT element', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const input = document.createElement('input');
    document.body.appendChild(input);

    window.addEventListener('keydown', handler);
    input.dispatchEvent(makeEvent('z', { ctrlKey: true }));
    window.removeEventListener('keydown', handler);

    document.body.removeChild(input);
    expect(spy).not.toHaveBeenCalled();
  });

  test('does not dispatch when target is inside .lexical-editor', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const editor = document.createElement('div');
    editor.className = 'lexical-editor';
    const inner = document.createElement('span');
    editor.appendChild(inner);
    document.body.appendChild(editor);

    window.addEventListener('keydown', handler);
    inner.dispatchEvent(makeEvent('z', { ctrlKey: true }));
    window.removeEventListener('keydown', handler);

    document.body.removeChild(editor);
    expect(spy).not.toHaveBeenCalled();
  });
});

// ── Shortcut dispatches ───────────────────────────────────────────────────────

describe('Ctrl+Z → fileUndo', () => {
  test('dispatches fileUndo and calls preventDefault', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const event = makeEvent('z');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'file/fileUndo' }));
    expect(preventSpy).toHaveBeenCalled();
  });

  test('also fires for Cmd+Z (metaKey)', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    handler(makeEvent('z', { metaKey: true }));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'file/fileUndo' }));
  });
});

describe('Ctrl+Y → fileRedo', () => {
  test('dispatches fileRedo and calls preventDefault', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const event = makeEvent('y');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'file/fileRedo' }));
    expect(preventSpy).toHaveBeenCalled();
  });
});

describe('Ctrl+F → searchSetVisible(true)', () => {
  test('dispatches searchSetVisible(true) and calls preventDefault', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const event = makeEvent('f');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(spy).toHaveBeenCalledWith(
      expect.objectContaining({ type: 'search/searchSetVisible', payload: true }),
    );
    expect(preventSpy).toHaveBeenCalled();
  });
});

describe('Ctrl+C — copy', () => {
  test('calls api.copy with full selection when selection is non-empty', () => {
    const store = makeStore();
    const api = makeApi();
    store.dispatch(appSetSelection([1, 2, 3]));
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('c'));

    expect(api.copy).toHaveBeenCalledWith([1, 2, 3], false);
  });

  test('does not call api.copy when selection is empty', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('c'));

    expect(api.copy).not.toHaveBeenCalled();
  });

  test('does not call preventDefault for copy', () => {
    const store = makeStore();
    const api = makeApi();
    store.dispatch(appSetSelection([5]));
    const handler = createKeyHandler(store as any, api);

    const event = makeEvent('c');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(preventSpy).not.toHaveBeenCalled();
  });
});

describe('Ctrl+X — cut', () => {
  test('calls api.cut with full selection when selection is non-empty', () => {
    const store = makeStore();
    const api = makeApi();
    store.dispatch(appSetSelection([10, 20]));
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('x'));

    expect(api.cut).toHaveBeenCalledWith([10, 20]);
  });

  test('does not call api.cut when selection is empty', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('x'));

    expect(api.cut).not.toHaveBeenCalled();
  });
});

describe('Ctrl+V — paste', () => {
  test('calls api.paste with focusedReqId when clipboard is non-null', () => {
    const store = makeStore();
    const api = makeApi();
    store.dispatch(appUpdateClipboard({ reqIds: [7], operation: 'copy' }));
    store.dispatch(appSetFocus({ id: 42, field: 'content', editable: false }));
    const handler = createKeyHandler(store as any, api);

    const event = makeEvent('v');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(api.paste).toHaveBeenCalledWith(42, false);
    expect(preventSpy).toHaveBeenCalled();
  });

  test('calls api.paste with 0 when clipboard non-null but no focused req', () => {
    const store = makeStore();
    const api = makeApi();
    store.dispatch(appUpdateClipboard({ reqIds: [7], operation: 'copy' }));
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('v'));

    expect(api.paste).toHaveBeenCalledWith(0, false);
  });

  test('does not call api.paste when clipboard is null', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);

    handler(makeEvent('v'));

    expect(api.paste).not.toHaveBeenCalled();
  });
});

// ── No-op when modifier is absent ─────────────────────────────────────────────

describe('no-op without modifier', () => {
  test('pressing z without ctrl/meta does not dispatch', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    handler(new KeyboardEvent('keydown', { key: 'z', bubbles: true }));

    expect(spy).not.toHaveBeenCalled();
  });
});
