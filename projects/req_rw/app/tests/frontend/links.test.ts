import { configureStore } from '@reduxjs/toolkit';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import appReducer from '../../src/frontend/store/appSlice';
import { selectFileLinkset } from '../../src/frontend/store/fileSliceMemoSelector';
import { FileState, Req } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

type Store = ReturnType<typeof makeStore>;

/** Builds a minimal FileState for tests that need a specific tree shape,
 *  filling in the fields spec 10 requires but that these tests don't exercise. */
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

function linkset(store: Store) {
  return selectFileLinkset(store.getState() as any);
}

// app.filepath is left unset (null) throughout — the selector falls back to
// file.present.identifier ('test-doc') for the href, per fileSliceMemoSelector.ts.

describe('selectFileLinkset — integer links', () => {
  test('produces an out entry on the source and an in entry on the target', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 2] },
      1: { id: 1, text: 'source', links: [2], children: [] },
      2: { id: 2, text: 'target', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 2)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([{ label: 'REQ-2', href: 'req://test-doc#1' }]);
    expect(ls[1].in).toEqual([]);
    expect(ls[2].in).toEqual([{ label: 'REQ-1' }]);
    expect(ls[2].out).toEqual([]);
  });
});

describe('selectFileLinkset — URL string links', () => {
  test('produces an out entry with label and href both equal to the string', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1] },
      1: { id: 1, text: 'source', links: ['https://example.com'], children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 1)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([{ label: 'https://example.com', href: 'https://example.com' }]);
    expect(ls[1].in).toEqual([]);
  });
});

describe('selectFileLinkset — {label, href} object links', () => {
  test('adds the object directly as an out entry', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1] },
      1: { id: 1, text: 'source', links: [{ label: 'Spec', href: 'https://spec.example' }], children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 1)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([{ label: 'Spec', href: 'https://spec.example' }]);
  });

  test('defaults label to an empty string when missing', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1] },
      1: { id: 1, text: 'source', links: [{ href: 'https://spec.example' }], children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 1)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([{ label: '', href: 'https://spec.example' }]);
  });
});

describe('selectFileLinkset — no links', () => {
  test('a req with no links field and a req with an empty links array produce no entries', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 2] },
      1: { id: 1, text: 'no links field', children: [] },
      2: { id: 2, text: 'empty links', links: [], children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 2)));

    const ls = linkset(store);
    expect(ls[1]).toBeUndefined();
    expect(ls[2]).toBeUndefined();
  });
});

describe('selectFileLinkset — multiple links', () => {
  test('accumulates multiple out entries in source order, across formats', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 2, 3] },
      1: {
        id: 1,
        text: 'source',
        links: [2, 'https://example.com', { label: 'Spec', href: 'https://spec.example' }],
        children: [],
      },
      2: { id: 2, text: 'target', children: [] },
      3: { id: 3, text: 'unrelated', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 3)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([
      { label: 'REQ-2', href: 'req://test-doc#1' },
      { label: 'https://example.com', href: 'https://example.com' },
      { label: 'Spec', href: 'https://spec.example' },
    ]);
  });
});

describe('selectFileLinkset — bidirectional reqs', () => {
  test('a req that is both a link source and a link target has non-empty out and in', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 2] },
      1: { id: 1, text: 'a', links: [2], children: [] },
      2: { id: 2, text: 'b', links: [1], children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 2)));

    const ls = linkset(store);
    expect(ls[1].out).toEqual([{ label: 'REQ-2', href: 'req://test-doc#1' }]);
    expect(ls[1].in).toEqual([{ label: 'REQ-2' }]);
    expect(ls[2].out).toEqual([{ label: 'REQ-1', href: 'req://test-doc#2' }]);
    expect(ls[2].in).toEqual([{ label: 'REQ-1' }]);
  });
});
