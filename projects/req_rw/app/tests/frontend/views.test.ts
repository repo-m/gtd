import { configureStore } from '@reduxjs/toolkit';
import appReducer, { selectAppCurrentView, selectAppViewMismatches, appSetCurrentView } from '../../src/frontend/store/appSlice';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import searchReducer from '../../src/frontend/store/searchSlice';
import { getNewFileState } from '../../src/frontend/store/file';
import { VIEW_DEFAULT_NAME } from '../../src/frontend/constants/view_constants';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer, search: searchReducer } });
}

describe('selectAppCurrentView column filtering', () => {
  test('returns all 5 VIEW_DEFAULT columns when Category and Status fields exist', () => {
    const s = makeStore();
    s.dispatch(fileInit(getNewFileState()));
    const fields = selectAppCurrentView(s.getState()).map((c) => c.field);
    expect(fields).toEqual(['id', 'content', 'Category', 'links', 'Status']);
  });

  test('returns only 3 built-in columns when Category and Status fields are absent', () => {
    const s = makeStore();
    s.dispatch(fileInit({ ...getNewFileState(), fields: [] }));
    const fields = selectAppCurrentView(s.getState()).map((c) => c.field);
    expect(fields).toEqual(['id', 'content', 'links']);
  });
});

describe('selectAppViewMismatches', () => {
  test('missingFromFile lists non-built-in view columns absent from fileSlice.fields', () => {
    const s = makeStore();
    // File has no custom fields; VIEW_DEFAULT references Category and Status
    s.dispatch(fileInit({ ...getNewFileState(), fields: [] }));
    const { missingFromFile } = selectAppViewMismatches(s.getState());
    expect(missingFromFile).toEqual(['Category', 'Status']);
  });

  test('hiddenFromView lists fileSlice.fields not referenced by the active view', () => {
    const s = makeStore();
    // File has Category, Status, and Priority; VIEW_DEFAULT only has Category and Status
    s.dispatch(fileInit({
      ...getNewFileState(),
      fields: [
        { name: 'Category', type: 'Enumeration', editable: true, values: [] },
        { name: 'Status', type: 'Enumeration', editable: true, values: [] },
        { name: 'Priority', type: 'String', editable: true },
      ],
    }));
    const { hiddenFromView } = selectAppViewMismatches(s.getState());
    expect(hiddenFromView).toEqual(['Priority']);
  });

  test('built-in fields are excluded from both missingFromFile and hiddenFromView', () => {
    const s = makeStore();
    // Set a custom view with only built-ins; file has no custom fields
    s.dispatch(fileInit({ ...getNewFileState(), fields: [] }));
    s.dispatch(appSetCurrentView({
      viewName: VIEW_DEFAULT_NAME,
      columns: [
        { label: 'ID', field: 'id' },
        { label: 'Requirements', field: 'content' },
        { label: 'Links', field: 'links' },
      ],
    }));
    const { missingFromFile, hiddenFromView } = selectAppViewMismatches(s.getState());
    expect(missingFromFile).toEqual([]);
    expect(hiddenFromView).toEqual([]);
  });

  test('both lists are empty when view and file are in sync', () => {
    const s = makeStore();
    // File has Category and Status; VIEW_DEFAULT also has Category and Status
    s.dispatch(fileInit(getNewFileState()));
    const { missingFromFile, hiddenFromView } = selectAppViewMismatches(s.getState());
    expect(missingFromFile).toEqual([]);
    expect(hiddenFromView).toEqual([]);
  });
});
