import * as fs from 'fs';
import * as path from 'path';
import { configureStore } from '@reduxjs/toolkit';
import appReducer, {
  selectAppCurrentView,
  appLoadFileState,
} from '../../src/frontend/store/appSlice';
import fileReducer, { fileInit } from '../../src/frontend/store/fileSlice';
import searchReducer from '../../src/frontend/store/searchSlice';
import { getNewFileState, fileToState, storeToYaml } from '../../src/frontend/store/file';
import { VIEW_DEFAULT } from '../../src/frontend/constants/view_constants';

function makeStore() {
  return configureStore({ reducer: { app: appReducer, file: fileReducer, search: searchReducer } });
}

// AC1: storeToYaml strips views and defaultView
describe('AC1: storeToYaml does not emit views or defaultView', () => {
  test('serialising state loaded from full.rq produces no views: or defaultView: key', () => {
    const yaml = fs.readFileSync(path.join(__dirname, '../fixtures/full.rq'), 'utf-8');
    const state = fileToState(yaml);
    const output = storeToYaml(state);
    expect(output).not.toMatch(/^views:/m);
    expect(output).not.toMatch(/^defaultView:/m);
  });
});

// AC3: selectAppCurrentView ignores fileSlice.views
describe('AC3: selectAppCurrentView reads only from appSlice.views', () => {
  test('returns VIEW_DEFAULT columns when appSlice.views is empty after fileInit', () => {
    const s = makeStore();
    s.dispatch(fileInit(getNewFileState()));
    const resolved = selectAppCurrentView(s.getState());
    const fields = resolved.map((c) => c.field);
    expect(fields).toEqual(VIEW_DEFAULT.map((c) => c.field));
  });
});

// AC4: appLoadFileState populates appSlice.viewName and appSlice.views
describe('AC4: appLoadFileState populates view state', () => {
  test('selectAppCurrentView returns loaded columns after appLoadFileState', () => {
    const s = makeStore();
    s.dispatch(fileInit(getNewFileState()));
    const loadedColumns = [
      { field: 'id', label: 'ID', width: 60 },
      { field: 'content', label: 'Req', width: 400 },
    ];
    s.dispatch(appLoadFileState({ viewName: 'my-view', views: { 'my-view': loadedColumns } }));
    const resolved = selectAppCurrentView(s.getState());
    expect(resolved.map((c) => ({ field: c.field, label: c.label, width: c.width }))).toEqual(
      loadedColumns,
    );
  });
});
