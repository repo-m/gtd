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

export type EnumFilter = { type: 'enum'; include: string[] };
export type TextFilter = { type: 'text'; value: string };
export type FieldFilter = EnumFilter | TextFilter;

export interface ClipboardState {
  reqIds: number[];
  operation: 'copy' | 'cut';
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
  viewEditorOpen: boolean;
  isDirty: boolean;
  selection: number[];
  selectionAnchor: number | null;
  _undoFocus: FocusState | null;
  _hasUndoFocus: boolean;
  filters: Record<string, FieldFilter>;
  commandPaletteOpen: boolean;
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
    viewEditorOpen: false,
    isDirty: false,
    selection: [],
    selectionAnchor: null,
    _undoFocus: null,
    _hasUndoFocus: false,
    filters: {},
    commandPaletteOpen: false,
  } as AppState,
  reducers: {
    appSetSelection(state, action: PayloadAction<number[]>) {
      state.selection = action.payload;
      state.selectionAnchor = action.payload.length > 0 ? action.payload[action.payload.length - 1] : null;
    },
    appClearSelection(state) {
      state.selection = [];
      state.selectionAnchor = null;
    },
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
    appToggleEditMode(state) {
      state.editMode = !state.editMode;
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
    appLoadFileState(
      state,
      action: PayloadAction<{ viewName: string | null; views: Record<string, ViewColumn[]> }>,
    ) {
      state.viewName = action.payload.viewName;
      const views: Record<string, NamedViewDef> = {};
      for (const [name, columns] of Object.entries(action.payload.views)) {
        views[name] = { columns };
      }
      state.views = views;
    },
    appOpenViewEditor(state) {
      state.viewEditorOpen = true;
    },
    appCloseViewEditor(state) {
      state.viewEditorOpen = false;
    },
    appAddView(state, action: PayloadAction<string>) {
      const name = action.payload;
      state.views[name] = { columns: [] };
      state.viewName = name;
    },
    appRenameView(state, action: PayloadAction<{ from: string; to: string }>) {
      const { from, to } = action.payload;
      if (state.views[from]) {
        state.views[to] = state.views[from];
        delete state.views[from];
      }
      if (state.viewName === from) {
        state.viewName = to;
      }
    },
    appDeleteView(state, action: PayloadAction<string>) {
      const name = action.payload;
      delete state.views[name];
      if (state.viewName === name) {
        state.viewName = VIEW_DEFAULT_NAME;
      }
    },
    appSetFilter(state, action: PayloadAction<{ field: string; filter: FieldFilter }>) {
      state.filters[action.payload.field] = action.payload.filter;
    },
    appClearFilter(state, action: PayloadAction<string>) {
      delete state.filters[action.payload];
    },
    appClearAllFilters(state) {
      state.filters = {};
    },
    appOpenCommandPalette(state) {
      state.commandPaletteOpen = true;
    },
    appCloseCommandPalette(state) {
      state.commandPaletteOpen = false;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) => action.type === 'file/fileInit',
      (state) => {
        state.viewName = null;
        state.views = {};
        state.isDirty = false;
        state.selection = [];
        state.selectionAnchor = null;
        state.clipboard = null;
        state.filters = {};
      },
    );
    builder.addMatcher(
      (action) => action.type === 'file/fileDeleteReq',
      (state) => {
        state.selection = [];
        state.selectionAnchor = null;
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
    builder.addMatcher(
      (action) =>
        typeof action.type === 'string' &&
        action.type.startsWith('file/') &&
        action.type !== 'file/fileInit' &&
        action.type !== 'file/fileSave' &&
        action.type !== 'file/fileSaveAs',
      (state) => {
        state.isDirty = true;
      },
    );
    builder.addMatcher(
      (action) =>
        action.type === 'file/fileSave' || action.type === 'file/fileSaveAs',
      (state) => {
        state.isDirty = false;
      },
    );
  },
});

export const {
  appSetSelection,
  appClearSelection,
  appSetError,
  appClearError,
  appSetPath,
  appSetContentMode,
  appOpenAttributes,
  appCloseAttributes,
  appSetEditMode,
  appToggleEditMode,
  appToggleSidebar,
  appSetTheme,
  appSetViewName,
  appToggleFocus,
  appSetFocus,
  appSetUndoFocus,
  appClearFocus,
  appSetCurrentView,
  appUpdateClipboard,
  appLoadFileState,
  appOpenViewEditor,
  appCloseViewEditor,
  appAddView,
  appRenameView,
  appDeleteView,
  appSetFilter,
  appClearFilter,
  appClearAllFilters,
  appOpenCommandPalette,
  appCloseCommandPalette,
} = appSlice.actions;

export const selectAppCommandPaletteOpen = (state: RootState) => state.app.commandPaletteOpen;

export const selectAppFilters = (state: RootState) => state.app.filters;
export const selectAppIsFiltering = (state: RootState) => Object.keys(state.app.filters).length > 0;

export const selectAppSelection = (state: RootState) => state.app.selection;
export const selectAppSelectionAnchor = (state: RootState) => state.app.selectionAnchor;
export const selectAppSidebar = (state: RootState) => state.app.sidebar;
export const selectAppClipboard = (state: RootState) => state.app.clipboard;
export const selectAppTheme = (state: RootState) => state.app.theme;
export const selectAppIsDirty = (state: RootState) => state.app.isDirty;
export const selectAppFocusReqId = (state: RootState): number | null => state.app.focus?.id ?? null;

export const selectAppResolvedTheme = (state: RootState): 'light' | 'dark' => {
  const setting = state.app.theme;
  if (setting !== 'system') return setting;
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

const BUILTIN_FIELDS = new Set(['id', 'content', 'links']);

export const selectAppCurrentView = createSelector(
  (state: RootState) => state.app.viewName,
  (state: RootState) => state.app.views,
  (state: RootState) => state.file.present.fields,
  (viewName, appViews, fields): ResolvedColumn[] => {
    const name = viewName ?? VIEW_DEFAULT_NAME;
    const columns = appViews[name]?.columns ?? VIEW_DEFAULT;
    const fieldMap = new Map(fields.map((f) => [f.name, f]));
    return columns
      .filter((col) => BUILTIN_FIELDS.has(col.field) || fieldMap.has(col.field))
      .map((col) => ({ ...col, fieldDef: fieldMap.get(col.field) ?? null }));
  },
);

export interface ViewMismatches {
  missingFromFile: string[];
  hiddenFromView: string[];
}

export const selectAppViewMismatches = createSelector(
  (state: RootState) => state.app.viewName,
  (state: RootState) => state.app.views,
  (state: RootState) => state.file.present.fields,
  (viewName, appViews, fields): ViewMismatches => {
    const name = viewName ?? VIEW_DEFAULT_NAME;
    const columns = appViews[name]?.columns ?? VIEW_DEFAULT;
    const fieldNames = new Set(fields.map((f) => f.name));
    const viewColumnFields = new Set(columns.map((c) => c.field));
    const missingFromFile = columns
      .filter((col) => !BUILTIN_FIELDS.has(col.field) && !fieldNames.has(col.field))
      .map((col) => col.field);
    const hiddenFromView = fields
      .filter((f) => !BUILTIN_FIELDS.has(f.name) && !viewColumnFields.has(f.name))
      .map((f) => f.name);
    return { missingFromFile, hiddenFromView };
  },
);

export default appSlice.reducer;
