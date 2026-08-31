/**
 * @jest-environment jsdom
 */

import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appOpenCommandPalette,
  appCloseCommandPalette,
  selectAppCommandPaletteOpen,
} from '../../src/frontend/store/appSlice';
import fileReducer from '../../src/frontend/store/fileSlice';
import searchReducer from '../../src/frontend/store/searchSlice';
import { createKeyHandler } from '../../src/frontend/hooks/useGlobalHotkeys';
import { filterCommands } from '../../src/frontend/components/CommandPalette/filterCommands';
import type { Command } from '../../src/frontend/components/CommandPalette/filterCommands';
import { buildNavCommands } from '../../src/frontend/components/CommandPalette/buildNavCommands';

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

function noopCmd(overrides: Partial<Command> = {}): Command {
  return {
    id: 'noop',
    label: 'Noop',
    section: 'Actions',
    action: () => {},
    ...overrides,
  };
}

// ── appSlice: commandPaletteOpen state ───────────────────────────────────────

describe('appOpenCommandPalette', () => {
  test('sets commandPaletteOpen to true', () => {
    const store = makeStore();
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(false);
    store.dispatch(appOpenCommandPalette());
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(true);
  });
});

describe('appCloseCommandPalette', () => {
  test('sets commandPaletteOpen to false after open', () => {
    const store = makeStore();
    store.dispatch(appOpenCommandPalette());
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(true);
    store.dispatch(appCloseCommandPalette());
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(false);
  });
});

describe('selectAppCommandPaletteOpen', () => {
  test('returns false from initial state', () => {
    const store = makeStore();
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(false);
  });

  test('reflects open/close transitions correctly', () => {
    const store = makeStore();
    store.dispatch(appOpenCommandPalette());
    store.dispatch(appCloseCommandPalette());
    store.dispatch(appOpenCommandPalette());
    expect(selectAppCommandPaletteOpen(store.getState())).toBe(true);
  });
});

// ── Ctrl+K hotkey ────────────────────────────────────────────────────────────

describe('Ctrl+K → appOpenCommandPalette', () => {
  test('dispatches appOpenCommandPalette and calls preventDefault', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    const event = makeEvent('k');
    const preventSpy = jest.spyOn(event, 'preventDefault');
    handler(event);

    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'app/appOpenCommandPalette' }));
    expect(preventSpy).toHaveBeenCalled();
  });

  test('also fires for Cmd+K (metaKey)', () => {
    const store = makeStore();
    const api = makeApi();
    const handler = createKeyHandler(store as any, api);
    const spy = jest.spyOn(store, 'dispatch');

    handler(makeEvent('k', { metaKey: true }));
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ type: 'app/appOpenCommandPalette' }));
  });
});

// ── filterCommands ───────────────────────────────────────────────────────────

describe('filterCommands — empty query', () => {
  test('returns all non-Navigate commands when query is empty', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
      noopCmd({ id: 'view-table', label: 'Table View', section: 'View' }),
      noopCmd({ id: 'nav-1', label: 'REQ-1  Foo', section: 'Navigate' }),
      noopCmd({ id: 'nav-2', label: 'REQ-2  Bar', section: 'Navigate' }),
    ];
    const result = filterCommands(cmds, '');
    expect(result).toHaveLength(2);
    expect(result.every((c) => c.section !== 'Navigate')).toBe(true);
  });

  test('treats whitespace-only query as empty', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
      noopCmd({ id: 'nav-1', label: 'REQ-1  Foo', section: 'Navigate' }),
    ];
    const result = filterCommands(cmds, '   ');
    expect(result).toHaveLength(1);
    expect(result[0].section).not.toBe('Navigate');
  });
});

describe('filterCommands — matching query', () => {
  test('returns commands whose label contains query (case-insensitive)', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
      noopCmd({ id: 'redo', label: 'Redo', section: 'Actions' }),
      noopCmd({ id: 'view-table', label: 'Table View', section: 'View' }),
      noopCmd({ id: 'nav-1', label: 'REQ-1  Safety requirement', section: 'Navigate' }),
    ];
    const result = filterCommands(cmds, 'undo');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('undo');
  });

  test('matches Navigate commands when query is non-empty', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
      noopCmd({ id: 'nav-1', label: 'REQ-1  Safety requirement', section: 'Navigate' }),
      noopCmd({ id: 'nav-2', label: 'REQ-2  Other', section: 'Navigate' }),
    ];
    const result = filterCommands(cmds, 'safety');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nav-1');
  });

  test('matches on keywords when label does not match', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'nav-42', label: 'REQ-42  Some text', section: 'Navigate', keywords: ['42'] }),
      noopCmd({ id: 'nav-99', label: 'REQ-99  Other', section: 'Navigate', keywords: ['99'] }),
    ];
    const result = filterCommands(cmds, '42');
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nav-42');
  });

  test('is case-insensitive', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
    ];
    expect(filterCommands(cmds, 'UNDO')).toHaveLength(1);
    expect(filterCommands(cmds, 'UnDo')).toHaveLength(1);
  });
});

// ── buildNavCommands ─────────────────────────────────────────────────────────

describe('buildNavCommands — root sentinel exclusion', () => {
  test('excludes the root id from the Navigate section', () => {
    const reqIds = [1, 2, 3]; // 1 is the root sentinel
    const requirements = {
      1: { heading: 'Document Root' },
      2: { heading: 'First requirement' },
      3: { heading: 'Second requirement' },
    };
    const cmds = buildNavCommands(reqIds, requirements, 1, () => {});
    expect(cmds.map((c) => c.id)).toEqual(['nav-2', 'nav-3']);
    expect(cmds.some((c) => c.label.includes('REQ-1'))).toBe(false);
  });

  test('includes all ids when rootId is null', () => {
    const reqIds = [2, 3];
    const requirements = { 2: { heading: 'A' }, 3: { heading: 'B' } };
    const cmds = buildNavCommands(reqIds, requirements, null, () => {});
    expect(cmds.map((c) => c.id)).toEqual(['nav-2', 'nav-3']);
  });
});

describe('filterCommands — no-match query', () => {
  test('returns empty array when nothing matches', () => {
    const cmds: Command[] = [
      noopCmd({ id: 'undo', label: 'Undo', section: 'Actions' }),
      noopCmd({ id: 'redo', label: 'Redo', section: 'Actions' }),
    ];
    const result = filterCommands(cmds, 'xyzzy_no_match');
    expect(result).toHaveLength(0);
  });
});
