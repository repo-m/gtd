import { createSlice, createSelector, PayloadAction } from '@reduxjs/toolkit';
import type { ViewColumn, NamedViewDef, FieldDef } from './file';
import type { RootState } from './store';
import { VIEW_DEFAULT, VIEW_DEFAULT_NAME } from '../constants/view_constants';
import { THEME_STORAGE_KEY } from '../constants/app_constants';

export interface ResolvedColumn extends ViewColumn {
  fieldDef: FieldDef | null;
}

export type ContentMode = 'TABLE' | 'RAW' | 'FILE' | 'REGIF';
export type ThemeSetting = 'light' | 'dark' | 'system';

export interface ClipboardState {
  reqId: number;
  operation: 'copy' | 'cut';
  mimeType: string;
}

export interface FocusState {
  id: number;
  field: string;
  editable: boolean;
  postCreate?: boolean;
  index?: number;
  children: number[];
}

interface AppState {
  lastError: string | null;
  filepath: string | null;
  filename: string | null;
  contentMode: ContentMode;
  attributesOpen: boolean;
  editMode: boolean;
  sidebar: boolean;
  theme: ThemeSetting;
  viewName: string | null;
  focus: FocusState | null;
  views: Record<string, NamedViewDef>;
  clipboard: ClipboardState | null;
  _undoFocus: FocusState | null;
  _hasUndoFocus: boolean;
}

const appSlice = createSlice({
  name: 'app',
  initialState: {
    lastError: null,
    filepath: null,
    filename: null,
    contentMode: 'TABLE' as ContentMode,
    attributesOpen: false,
    editMode: false,
    sidebar: false,
    theme: 'system' as ThemeSetting,
    viewName: null,
    focus: null,
    views: {},
    clipboard: null,
    _undoFocus: null,
    _hasUndoFocus: false,
  } as AppState,
  reducers: {
    appSetError(state, action: PayloadAction<string>) {
      state.lastError = action.payload;
    },
    appClearError(state) {
      state.lastError = null;
    },
    appSetPath(state, action: PayloadAction<{ filepath: string; filename: string }>) {
      state.filepath = action.payload.filepath;
      state.filename = action.payload.filename;
    },
    appSetContentMode(state, action: PayloadAction<ContentMode>) {
      state.contentMode = action.payload;
    },
    appOpenAttributes(state) {
      state.attributesOpen = true;
    },
    appCloseAttributes(state) {
      state.attributesOpen = false;
    },
    appSetEditMode(state, action: PayloadAction<boolean>) {
      state.editMode = action.payload;
    },
    appSetViewName(state, action: PayloadAction<string | null>) {
      state.viewName = action.payload;
    },
    appToggleFocus(
      state,
      action: PayloadAction<{ id: number; field: string; index?: number; children: number[] }>,
    ) {
      const { id, field, index, children } = action.payload;
      if (state.focus?.id === id && state.focus?.field === field) {
        state.focus = null;
      } else {
        state.focus = { id, field, editable: false, index, children };
      }
    },
    appSetFocus(
      state,
      action: PayloadAction<{
        id: number;
        field: string;
        editable: boolean;
        postCreate?: boolean;
        index?: number;
        children?: number[];
      }>,
    ) {
      const { id, field, editable, postCreate, index, children } = action.payload;
      state.focus = {
        id,
        field,
        editable,
        postCreate,
        index: index ?? state.focus?.index,
        children: children ?? state.focus?.children ?? [],
      };
    },
    appSetUndoFocus(state, action: PayloadAction<FocusState | null>) {
      state._undoFocus = action.payload;
      state._hasUndoFocus = true;
    },
    appClearFocus(state) {
      state.focus = null;
    },
    appToggleSidebar(state) {
      state.sidebar = !state.sidebar;
    },
    appSetTheme(state, action: PayloadAction<ThemeSetting>) {
      state.theme = action.payload;
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(THEME_STORAGE_KEY, action.payload);
      }
    },
    appSetCurrentView(
      state,
      action: PayloadAction<{ viewName: string; columns: ViewColumn[] }>,
    ) {
      const { viewName, columns } = action.payload;
      state.views[viewName] = { columns };
    },
    appUpdateClipboard(state, action: PayloadAction<ClipboardState | null>) {
      state.clipboard = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'file/fileInit',
      (state) => {
        state.views[VIEW_DEFAULT_NAME] = { columns: VIEW_DEFAULT };
      },
    );
    builder.addMatcher(
      (action) => action.type === 'file/fileUndo',
      (state) => {
        if (state._hasUndoFocus) {
          state.focus = state._undoFocus;
          state._undoFocus = null;
          state._hasUndoFocus = false;
        }
      },
    );
  },
});

export const {
  appSetError,
  appClearError,
  appSetPath,
  appSetContentMode,
  appOpenAttributes,
  appCloseAttributes,
  appSetEditMode,
  appToggleSidebar,
  appSetTheme,
  appSetViewName,
  appToggleFocus,
  appSetFocus,
  appSetUndoFocus,
  appClearFocus,
  appSetCurrentView,
  appUpdateClipboard,
} = appSlice.actions;

export const selectAppSidebar = (state: RootState) => state.app.sidebar;
export const selectAppClipboard = (state: RootState) => state.app.clipboard;
export const selectAppTheme = (state: RootState) => state.app.theme;

export const selectAppResolvedTheme = (state: RootState): 'light' | 'dark' => {
  const setting = state.app.theme;
  if (setting !== 'system') return setting;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

export const selectAppCurrentView = createSelector(
  (state: RootState) => state.app.viewName,
  (state: RootState) => state.app.views,
  (state: RootState) => state.file.present.views,
  (state: RootState) => state.file.present.fields,
  (viewName, appViews, fileViews, fields): ResolvedColumn[] => {
    const name = viewName ?? VIEW_DEFAULT_NAME;
    const appCols = appViews[name]?.columns;
    const fileCols = fileViews[name]?.columns;
    const base = fileCols ?? VIEW_DEFAULT;
    const columns = appCols
      ? base.map((col, i) => ({ ...col, width: appCols[i]?.width ?? col.width }))
      : base;
    const fieldMap = new Map(fields.map((f) => [f.name, f]));
    return columns.map((col) => ({ ...col, fieldDef: fieldMap.get(col.field) ?? null }));
  },
);

export default appSlice.reducer;
