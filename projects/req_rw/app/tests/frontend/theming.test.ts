import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appSetTheme,
  selectAppResolvedTheme,
  ThemeSetting,
} from '../../src/frontend/store/appSlice';
import type { RootState } from '../../src/frontend/store/store';

const localStorageData: Record<string, string> = {};

beforeAll(() => {
  Object.defineProperty(global, 'localStorage', {
    value: {
      getItem: (k: string) => localStorageData[k] ?? null,
      setItem: (k: string, v: string) => { localStorageData[k] = v; },
      removeItem: (k: string) => { delete localStorageData[k]; },
      clear: () => { Object.keys(localStorageData).forEach((k) => delete localStorageData[k]); },
    },
    writable: true,
    configurable: true,
  });
  (global as any).window = {
    matchMedia: (_: string) => ({ matches: false }),
  };
});

beforeEach(() => {
  Object.keys(localStorageData).forEach((k) => delete localStorageData[k]);
});

function makeStore() {
  return configureStore({ reducer: { app: appReducer } });
}

function stateWithTheme(theme: ThemeSetting) {
  return { app: { theme } } as unknown as RootState;
}

describe('appSlice theme — criterion 1', () => {
  test('initialises to system', () => {
    const state = appReducer(undefined, { type: '@@INIT' });
    expect(state.theme).toBe('system');
  });

  test('appSetTheme updates state', () => {
    const store = makeStore();
    store.dispatch(appSetTheme('dark'));
    expect(store.getState().app.theme).toBe('dark');
  });

  test('appSetTheme writes to localStorage under req.theme', () => {
    const store = makeStore();
    store.dispatch(appSetTheme('dark'));
    expect(localStorageData['req.theme']).toBe('dark');
  });

  test('appSetTheme writes light to localStorage', () => {
    const store = makeStore();
    store.dispatch(appSetTheme('light'));
    expect(localStorageData['req.theme']).toBe('light');
  });
});

describe('selectAppResolvedTheme — criterion 2', () => {
  test('returns light when theme is light', () => {
    expect(selectAppResolvedTheme(stateWithTheme('light'))).toBe('light');
  });

  test('returns dark when theme is dark', () => {
    expect(selectAppResolvedTheme(stateWithTheme('dark'))).toBe('dark');
  });

  test('never returns system when theme is system', () => {
    const result = selectAppResolvedTheme(stateWithTheme('system'));
    expect(result).not.toBe('system');
    expect(['light', 'dark']).toContain(result);
  });
});
