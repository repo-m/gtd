import { configureStore } from '@reduxjs/toolkit';
import fileReducer, {
  fileInit,
  fileCreateNextReq,
  fileCreateChildReq,
  fileDeleteReq,
  fileImportNextReq,
  fileImportChildReq,
} from '../../src/frontend/store/fileSlice';
import {
  selectFileReqList,
  selectFileRequirements,
} from '../../src/frontend/store/fileSliceMemoSelector';
import { getNewFileState, storeToSubFile, FileState, Req } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { file: fileReducer } });
}

type Store = ReturnType<typeof makeStore>;

function requirements(store: Store): Record<number, Req> {
  return (store.getState() as any).file.present.requirements;
}

function root(store: Store): number {
  return (store.getState() as any).file.present.root;
}

function reqList(store: Store): number[] {
  return selectFileReqList(store.getState() as any);
}

function allRequirements(store: Store): Record<number, Req> {
  return selectFileRequirements(store.getState() as any);
}

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

/** Mirrors BaseApi's `_wrapWithSentinel` — wraps a sub-tree rooted at `id` in a
 *  sentinel node so it can be handed to `fileImportNextReq` / `fileImportChildReq`. */
function wrapWithSentinel(subFile: FileState, rootId: number): FileState {
  const sentinelId = -1;
  return {
    ...subFile,
    root: sentinelId,
    requirements: {
      [sentinelId]: { id: sentinelId, children: [rootId] },
      ...subFile.requirements,
    },
  };
}

/**
 * Moves `id` (with its whole subtree, ids preserved) to become the next sibling
 * after `targetId`, or the first child of `targetId` when `asChild` is true.
 *
 * fileSlice.ts has no dedicated "reorder"/"indent"/"outdent" reducer — this is
 * the actual mechanism the app uses for all three (see BaseApi.paste()'s 'cut'
 * branch): delete the subtree, then re-import it with `merge: true` so ids are
 * kept rather than reallocated.
 */
function moveReq(store: Store, id: number, targetId: number, asChild: boolean): void {
  const state = (store.getState() as any).file.present as FileState;
  const subFile = storeToSubFile(state, id);
  const importState = wrapWithSentinel(subFile, id);
  store.dispatch(fileDeleteReq(id));
  const importFn = asChild ? fileImportChildReq : fileImportNextReq;
  store.dispatch(importFn({ importState, targetId, merge: true }));
}

describe('Requirement tree data model — updateMeta() level/num', () => {
  test('fileInit computes level/num for the default new-document tree', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const reqs = requirements(store);
    // root (id 0) is a sentinel — traverse() only assigns level/num to children
    expect(reqs[0].level).toBeUndefined();
    expect(reqs[0].num).toBeUndefined();
    // 'Section 1' is the first (and only) heading under root
    expect(reqs[1].level).toBe(1);
    expect(reqs[1].num).toBe('1');
    // the blank entry is nested one level under its heading parent
    expect(reqs[2].level).toBe(2);
    expect(reqs[2].num).toBe('1-1');
  });

  test('numbers headings (1, 1.1, 2, ...) and entries (0-1, 1-1, ...) across mixed levels', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 4] },
      1: { id: 1, heading: 'H1', children: [2, 3] },
      2: { id: 2, heading: 'H1.1', children: [] },
      3: { id: 3, text: 'entry under H1', children: [] },
      4: { id: 4, heading: 'H2', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 4)));
    const reqs = requirements(store);

    expect(reqs[1].level).toBe(1);
    expect(reqs[1].num).toBe('1');
    expect(reqs[2].level).toBe(2);
    expect(reqs[2].num).toBe('1.1');
    expect(reqs[3].level).toBe(2);
    expect(reqs[3].num).toBe('1-1');
    expect(reqs[4].level).toBe(1);
    expect(reqs[4].num).toBe('2');
  });

  test('entries directly under root get 0-1, 0-2, ... numbering', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1, 2] },
      1: { id: 1, text: 'e1', children: [] },
      2: { id: 2, text: 'e2', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 2)));
    const reqs = requirements(store);

    expect(reqs[1].level).toBe(1);
    expect(reqs[1].num).toBe('0-1');
    expect(reqs[2].level).toBe(1);
    expect(reqs[2].num).toBe('0-2');
  });
});

describe('fileCreateNextReq — sibling insertion', () => {
  test('inserts a new blank req immediately after the given id, as a sibling', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1)); // 1 is root's only child ('Section 1')

    const reqs = requirements(store);
    const newId = 3; // max was 2, so the next allocated id is 3
    expect(reqs[0].children).toEqual([1, newId]);
    expect(reqs[newId]).toBeDefined();
    expect(reqs[newId].children).toEqual([]);
    // no heading -> entry, numbered relative to root's own numbering scope
    expect(reqs[newId].level).toBe(1);
    expect(reqs[newId].num).toBe('0-1');
  });

  test('inserts after a nested id, splicing into the correct parent at the correct index', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(2)); // 2 is req[1]'s only child

    const reqs = requirements(store);
    const newId = 3;
    expect(reqs[1].children).toEqual([2, newId]);
    expect(reqs[newId].level).toBe(2);
    expect(reqs[newId].num).toBe('1-2');
  });

  test('with id undefined, appends the new req to the root\'s children', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(undefined));

    const reqs = requirements(store);
    expect(reqs[0].children).toEqual([1, 3]);
  });

  test('allocates a strictly increasing id and bumps max/next', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));
    const state = (store.getState() as any).file.present;
    expect(state.max).toBe(3);
    expect(state.next).toBe(4);
  });
});

describe('fileCreateChildReq — child insertion', () => {
  test('inserts a new blank req as the first entry in the parent\'s children', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateChildReq(1)); // req[1].children was [2]

    const reqs = requirements(store);
    const newId = 3;
    expect(reqs[1].children).toEqual([newId, 2]);
    expect(reqs[newId].level).toBe(2);
    expect(reqs[newId].num).toBe('1-1');
    // the pre-existing entry is renumbered to make way for the new first child
    expect(reqs[2].num).toBe('1-2');
  });
});

describe('fileDeleteReq — removes the req and its subtree', () => {
  test('removes a leaf req from its parent\'s children and from requirements', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileDeleteReq(2));

    const reqs = requirements(store);
    expect(reqs[2]).toBeUndefined();
    expect(reqs[1].children).toEqual([]);
  });

  test('removes an entire subtree (BFS), not just the direct req', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [1] },
      1: { id: 1, heading: 'H1', children: [2, 3] },
      2: { id: 2, heading: 'H1.1', children: [4] },
      3: { id: 3, text: 'e', children: [] },
      4: { id: 4, text: 'grandchild', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 4)));
    store.dispatch(fileDeleteReq(1));

    const reqs = requirements(store);
    expect(reqs[0].children).toEqual([]);
    expect(reqs[1]).toBeUndefined();
    expect(reqs[2]).toBeUndefined();
    expect(reqs[3]).toBeUndefined();
    expect(reqs[4]).toBeUndefined();
  });

  test('deleting the root req is a no-op', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    const before = requirements(store);
    store.dispatch(fileDeleteReq(root(store)));
    const after = requirements(store);
    expect(after).toEqual(before);
  });
});

describe('Reorder / indent / outdent (move via delete + merge-import)', () => {
  test('indent: a sibling becomes the first child of its preceding sibling', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [10, 20] },
      10: { id: 10, text: 'A', children: [] },
      20: { id: 20, text: 'B', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 20)));

    moveReq(store, 20, 10, true);

    const reqs = requirements(store);
    expect(reqs[0].children).toEqual([10]);
    expect(reqs[10].children).toEqual([20]);
    expect(reqs[20]).toBeDefined();
    expect(reqs[20].level).toBe((reqs[10].level as number) + 1);
  });

  test('outdent: a child becomes the next sibling of its former parent', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [10] },
      10: { id: 10, text: 'A', children: [20] },
      20: { id: 20, text: 'B', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 20)));

    moveReq(store, 20, 10, false);

    const reqs = requirements(store);
    expect(reqs[10].children).toEqual([]);
    expect(reqs[0].children).toEqual([10, 20]);
    expect(reqs[20].level).toBe(reqs[10].level);
  });

  test('reorder: moving a req changes its position among siblings, ids preserved', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [10, 20, 30] },
      10: { id: 10, text: 'A', children: [] },
      20: { id: 20, text: 'B', children: [] },
      30: { id: 30, text: 'C', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 30)));

    moveReq(store, 30, 10, false); // move C to right after A

    const reqs = requirements(store);
    expect(reqs[0].children).toEqual([10, 30, 20]);
    expect(reqList(store)).toEqual([0, 10, 30, 20]);
  });

  test('moving a req with descendants preserves its whole subtree', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      0: { id: 0, children: [10, 20] },
      10: { id: 10, text: 'A', children: [] },
      20: { id: 20, heading: 'B', children: [21] },
      21: { id: 21, text: 'B child', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 0, 21)));

    moveReq(store, 20, 10, true); // indent the heading (with its child) under A

    const reqs = requirements(store);
    expect(reqs[10].children).toEqual([20]);
    expect(reqs[20].children).toEqual([21]);
    expect(reqs[21]).toBeDefined();
  });
});

describe('storeToSubFile — multi-id export', () => {
  test('single id: unchanged shape — root is the id itself, no sentinel', () => {
    const state = makeFileState(
      {
        0: { id: 0, children: [1] },
        1: { id: 1, text: 'A', children: [] },
      },
      0,
      1,
    );
    const subFile = storeToSubFile(state, 1);
    expect(subFile.root).toBe(1);
    expect(subFile.requirements[-1]).toBeUndefined();
    expect(Object.keys(subFile.requirements).map(Number).sort()).toEqual([1]);
  });

  test('multiple sibling ids: root is a sentinel (-1) whose children are exactly the given ids', () => {
    const state = makeFileState(
      {
        0: { id: 0, children: [1, 2, 3] },
        1: { id: 1, text: 'A', children: [] },
        2: { id: 2, text: 'B', children: [] },
        3: { id: 3, text: 'C', children: [] },
      },
      0,
      3,
    );
    const subFile = storeToSubFile(state, [1, 2, 3]);
    expect(subFile.root).toBe(-1);
    expect(subFile.requirements[-1]).toEqual({ id: -1, children: [1, 2, 3] });
    expect(Object.keys(subFile.requirements).map(Number).sort((a, b) => a - b)).toEqual([-1, 1, 2, 3]);
  });

  test('a selected id that is a descendant of another selected id is not duplicated at the top level', () => {
    // 1 is a selected ancestor of 2 (also selected); both requested together.
    const state = makeFileState(
      {
        0: { id: 0, children: [1] },
        1: { id: 1, heading: 'Parent', children: [2] },
        2: { id: 2, text: 'Child', children: [] },
      },
      0,
      2,
    );
    const subFile = storeToSubFile(state, [1, 2]);
    // 2 stays nested under 1 — the sentinel's direct children are just [1].
    expect(subFile.requirements[-1].children).toEqual([1]);
    expect(subFile.requirements[1].children).toEqual([2]);
    expect(subFile.requirements[2]).toBeDefined();
  });

  test('wrapping a multi-id sentineled subFile with _wrapWithSentinel again does not corrupt it', () => {
    // Mirrors BaseApi._pasteFromInternal calling storeToSubFile(state, reqIds)
    // (already sentineled for >1 id) and then _wrapWithSentinel(subFile, subFile.root!)
    // unconditionally. Key-overwrite order in the object spread means the
    // freshly-built wrapper entry is overwritten by the real one already
    // present in subFile.requirements.
    const state = makeFileState(
      {
        0: { id: 0, children: [1, 2] },
        1: { id: 1, text: 'A', children: [] },
        2: { id: 2, text: 'B', children: [] },
      },
      0,
      2,
    );
    const subFile = storeToSubFile(state, [1, 2]);
    const doubleWrapped = wrapWithSentinel(subFile, subFile.root!);
    expect(doubleWrapped.root).toBe(-1);
    expect(doubleWrapped.requirements[-1]).toEqual({ id: -1, children: [1, 2] });
    expect(Object.keys(doubleWrapped.requirements).map(Number).sort((a, b) => a - b)).toEqual([-1, 1, 2]);
  });
});

describe('selectFileReqList — document order', () => {
  test('DFS pre-order traversal matches the spec 20 example tree', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      1: { id: 1, heading: 'root', children: [3, 2] },
      3: { id: 3, heading: '3', children: [5, 4] },
      2: { id: 2, text: '2', children: [] },
      5: { id: 5, text: '5', children: [] },
      4: { id: 4, text: '4', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 1, 5)));

    expect(reqList(store)).toEqual([1, 3, 5, 4, 2]);
  });

  test('reflects a deletion — the removed subtree is absent from the list', () => {
    const store = makeStore();
    const tree: Record<number, Req> = {
      1: { id: 1, heading: 'root', children: [3, 2] },
      3: { id: 3, heading: '3', children: [5, 4] },
      2: { id: 2, text: '2', children: [] },
      5: { id: 5, text: '5', children: [] },
      4: { id: 4, text: '4', children: [] },
    };
    store.dispatch(fileInit(makeFileState(tree, 1, 5)));
    store.dispatch(fileDeleteReq(3));

    expect(reqList(store)).toEqual([1, 2]);
    expect(allRequirements(store)[3]).toBeUndefined();
    expect(allRequirements(store)[5]).toBeUndefined();
    expect(allRequirements(store)[4]).toBeUndefined();
  });

  test('reflects an insertion at the correct position', () => {
    const store = makeStore();
    store.dispatch(fileInit(getNewFileState()));
    store.dispatch(fileCreateNextReq(1));

    expect(reqList(store)).toEqual([0, 1, 2, 3]);
  });
});
