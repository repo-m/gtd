import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  appSetFilter,
  appClearFilter,
  appClearAllFilters,
  selectAppFilters,
} from '../../src/frontend/store/appSlice';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import {
  selectFileReqList,
  selectFilteredReqList,
} from '../../src/frontend/store/fileSliceMemoSelector';
import type { FileState } from '../../src/frontend/store/file';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer } });
}

// root(0) → [1,2,3,4]; reqs have Status and Category field values for filter tests
function makeTestFileState(): FileState {
  return {
    identifier: 'filter-test',
    title: 'Filter Test',
    prefix: 'REQ',
    description: '',
    max: 4,
    next: 5,
    root: 0,
    requirements: {
      0: { id: 0, children: [1, 2, 3, 4] },
      1: { id: 1, Status: 'Open', Category: 'Functional', children: [] },
      2: { id: 2, Status: 'Closed', Category: 'Safety', children: [] },
      3: { id: 3, Status: 'Open', Category: 'Safety', children: [] },
      4: { id: 4, children: [] },
    },
    fields: [
      { name: 'Status', type: 'Enumeration', editable: true, values: ['Open', 'Closed'] },
      { name: 'Category', type: 'String', editable: true },
    ],
    types: [],
  };
}

describe('Filter selectors and reducers', () => {
  test('1. no active filters returns same list as selectFileReqList', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual(selectFileReqList(s));
  });

  test('2. enum filter {include:["Open"]} on Status hides non-Open rows', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual([1, 3]);
  });

  test('3. appClearFilter("Status") restores the full list', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    store.dispatch(appClearFilter('Status'));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual(selectFileReqList(s));
  });

  test('4. enum filter {include:[""]} shows only rows with no value for the field', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: [''] } }));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual([0, 4]);
  });

  test('5. enum filter {include:[]} returns an empty list', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: [] } }));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual([]);
  });

  test('6. text filter hides rows not containing value (case-insensitive)', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Category', filter: { type: 'text', value: 'safety' } }));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual([2, 3]);
  });

  test('7. appClearFilter removes the filter entry from state', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    store.dispatch(appClearFilter('Status'));
    const s = store.getState() as any;
    expect(selectAppFilters(s)).toEqual({});
  });

  test('8. two AND filters: row must satisfy both to appear', () => {
    const store = makeStore();
    store.dispatch(fileInit(makeTestFileState()));
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    store.dispatch(appSetFilter({ field: 'Category', filter: { type: 'text', value: 'safety' } }));
    const s = store.getState() as any;
    expect(selectFilteredReqList(s)).toEqual([3]);
  });

  test('9. appClearAllFilters resets filters to {}', () => {
    const store = makeStore();
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    store.dispatch(appSetFilter({ field: 'Category', filter: { type: 'text', value: 'foo' } }));
    store.dispatch(appClearAllFilters());
    const s = store.getState() as any;
    expect(selectAppFilters(s)).toEqual({});
  });

  test('10. fileInit resets filters to {}', () => {
    const store = makeStore();
    store.dispatch(appSetFilter({ field: 'Status', filter: { type: 'enum', include: ['Open'] } }));
    store.dispatch(fileInit(makeTestFileState()));
    const s = store.getState() as any;
    expect(selectAppFilters(s)).toEqual({});
  });
});
