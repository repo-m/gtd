import { configureStore } from '@reduxjs/toolkit';
import fileReducer, { fileInit, fileCreateNextReq } from '../../src/frontend/store/fileSlice';
import appReducer, { appSetContentMode } from '../../src/frontend/store/appSlice';
import searchReducer, {
  searchSetVisible,
  searchSetValue,
  searchStart,
  searchMoveIndex,
  searchSetIndex,
  searchClear,
} from '../../src/frontend/store/searchSlice';
import { searchMiddleware } from '../../src/frontend/store/searchMiddleware';
import { FileState, Req } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({
    reducer: { app: appReducer, file: fileReducer, search: searchReducer },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(searchMiddleware),
  });
}

type Store = ReturnType<typeof makeStore>;

function search(store: Store): any {
  return (store.getState() as any).search;
}

/** Builds a minimal FileState with known text spread across multiple fields,
 *  so a search term can be asserted to match specific (id, field) pairs. */
function makeFileState(requirements: Record<number, Req>, root: number, max: number): FileState {
  return {
    identifier: 'test-doc',
    title: 'Test',
    prefix: 'REQ',
    description: '',
    max,
    next: max + 1,
    root,
    requirements,
    fields: [],
    types: [],
  };
}

/** Fresh fixture object per call — fileInit/updateMeta mutate the requirements
 *  tree in place, and immer auto-freezes the produced state, so a shared
 *  module-level object would be frozen (and unusable) after the first test. */
function makeFixture(): Record<number, Req> {
  return {
    0: { id: 0, children: [1, 2] },
    // 'login' appears in both heading and text (different case in text)
    1: { id: 1, heading: 'Login Feature', text: 'The system shall allow login.', children: [] },
    // 'LOGIN' appears in text, uppercase — must still match case-insensitively;
    // 'logout' does NOT contain 'login' and must not match
    2: { id: 2, heading: 'Logout', text: 'A user can LOGIN or logout at any time.', children: [] },
  };
}

function loadFixture(store: Store): void {
  store.dispatch(fileInit(makeFileState(makeFixture(), 0, 2)));
}

beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});

describe('searchSetValue → middleware computes matches → searchSetResults', () => {
  test('populates results/resultMap/count and resets index to 0, matching case-insensitively across fields', () => {
    const store = makeStore();
    loadFixture(store);

    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();

    const state = search(store);
    // three matches: req1.heading ('Login'), req1.text ('login'), req2.text ('LOGIN')
    expect(state.count).toBe(3);
    expect(state.results).toHaveLength(3);
    expect(state.index).toBe(0);
    expect(state.inProgress).toBe(false);

    expect(state.resultMap[1].heading).toEqual([{ start: 0, end: 5 }]);
    expect(state.resultMap[1].text).toBeDefined();
    expect(state.resultMap[2].text).toBeDefined();
    // 'logout' does not contain 'login' — req2 has no heading match
    expect(state.resultMap[2].heading).toBeUndefined();
  });

  test('searchStart re-scans synchronously (no debounce) and produces the same matches', () => {
    const store = makeStore();
    loadFixture(store);

    // set the term without letting the debounce timer fire, then trigger a
    // synchronous re-scan via searchStart
    store.dispatch(searchSetValue('login'));
    store.dispatch(searchStart());

    const state = search(store);
    expect(state.count).toBe(3);
    expect(state.index).toBe(0);
  });

  test('an empty/whitespace term clears results instead of searching', () => {
    const store = makeStore();
    loadFixture(store);

    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
    expect(search(store).count).toBe(3);

    store.dispatch(searchSetValue('   '));
    jest.runAllTimers();

    const state = search(store);
    expect(state.count).toBe(0);
    expect(state.results).toEqual([]);
    expect(state.resultMap).toEqual({});
  });

  test('a term with no matches yields an empty result set', () => {
    const store = makeStore();
    loadFixture(store);

    store.dispatch(searchSetValue('nonexistentzzz'));
    jest.runAllTimers();

    expect(search(store).count).toBe(0);
    expect(search(store).results).toEqual([]);
  });
});

describe('searchSetVisible', () => {
  test('toggles isVisible', () => {
    const store = makeStore();
    expect(search(store).isVisible).toBe(false);

    store.dispatch(searchSetVisible(true));
    expect(search(store).isVisible).toBe(true);

    store.dispatch(searchSetVisible(false));
    expect(search(store).isVisible).toBe(false);
  });
});

describe('searchMoveIndex — wraparound navigation', () => {
  function loadAndSearch(store: Store): void {
    loadFixture(store);
    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
  }

  test('forward (true) wraps from the last match back to 0', () => {
    const store = makeStore();
    loadAndSearch(store);
    expect(search(store).count).toBe(3);

    store.dispatch(searchMoveIndex(true)); // 0 -> 1
    expect(search(store).index).toBe(1);
    store.dispatch(searchMoveIndex(true)); // 1 -> 2
    expect(search(store).index).toBe(2);
    store.dispatch(searchMoveIndex(true)); // 2 -> wraps to 0
    expect(search(store).index).toBe(0);
  });

  test('backward (false) wraps from 0 to the last match', () => {
    const store = makeStore();
    loadAndSearch(store);

    store.dispatch(searchMoveIndex(false)); // 0 -> wraps to 2 (last)
    expect(search(store).index).toBe(2);
    store.dispatch(searchMoveIndex(false)); // 2 -> 1
    expect(search(store).index).toBe(1);
  });

  test('is a no-op when count === 0', () => {
    const store = makeStore();
    expect(search(store).count).toBe(0);

    store.dispatch(searchMoveIndex(true));
    expect(search(store).index).toBe(0);
    store.dispatch(searchMoveIndex(false));
    expect(search(store).index).toBe(0);
  });
});

describe('searchSetIndex — clamping', () => {
  function loadAndSearch(store: Store): void {
    loadFixture(store);
    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
  }

  test('clamps to [0, count-1] for an in-range value', () => {
    const store = makeStore();
    loadAndSearch(store);

    store.dispatch(searchSetIndex(1));
    expect(search(store).index).toBe(1);
  });

  test('clamps a value above count-1 down to count-1', () => {
    const store = makeStore();
    loadAndSearch(store);

    store.dispatch(searchSetIndex(999));
    expect(search(store).index).toBe(2); // count - 1
  });

  test('clamps a negative value up to 0', () => {
    const store = makeStore();
    loadAndSearch(store);

    store.dispatch(searchSetIndex(-5));
    expect(search(store).index).toBe(0);
  });

  test('is a no-op when count === 0', () => {
    const store = makeStore();
    expect(search(store).count).toBe(0);

    store.dispatch(searchSetIndex(5));
    expect(search(store).index).toBe(0);
  });
});

describe('searchClear', () => {
  test('empties results/resultMap/count/index', () => {
    const store = makeStore();
    loadFixture(store);
    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
    store.dispatch(searchMoveIndex(true));
    expect(search(store).count).toBeGreaterThan(0);
    expect(search(store).index).toBeGreaterThan(0);

    store.dispatch(searchClear());

    const state = search(store);
    expect(state.results).toEqual([]);
    expect(state.resultMap).toEqual({});
    expect(state.count).toBe(0);
    expect(state.index).toBe(0);
  });
});

describe('extraReducers matcher — auto-clear on file/* and app/appSetContentMode', () => {
  test('any file/*-prefixed action clears populated search results', () => {
    const store = makeStore();
    loadFixture(store);
    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
    expect(search(store).count).toBeGreaterThan(0);

    store.dispatch(fileCreateNextReq(1));

    const state = search(store);
    expect(state.results).toEqual([]);
    expect(state.resultMap).toEqual({});
    expect(state.count).toBe(0);
    expect(state.index).toBe(0);
  });

  test('app/appSetContentMode clears populated search results', () => {
    const store = makeStore();
    loadFixture(store);
    store.dispatch(searchSetValue('login'));
    jest.runAllTimers();
    expect(search(store).count).toBeGreaterThan(0);

    store.dispatch(appSetContentMode('RAW'));

    const state = search(store);
    expect(state.results).toEqual([]);
    expect(state.resultMap).toEqual({});
    expect(state.count).toBe(0);
    expect(state.index).toBe(0);
  });
});
