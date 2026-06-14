import type { Middleware } from 'redux';
import type { FocusState } from './appSlice';
import type { NamedViewDef, FieldDef, ViewColumn } from './file';
import { fileCreateNextReq, fileCreateChildReq } from './fileSlice';
import { appSetFocus, appSetUndoFocus } from './appSlice';
import { VIEW_DEFAULT, VIEW_DEFAULT_NAME } from '../constants/view_constants';

type CreateReqState = {
  app: {
    focus: FocusState | null;
    viewName: string | null;
    views: Record<string, NamedViewDef>;
  };
  file: {
    present: {
      focusReqId: number | null;
      views: Record<string, NamedViewDef>;
      fields: FieldDef[];
    };
  };
};

function getFirstEditableField(state: CreateReqState): string {
  const name = state.app.viewName ?? VIEW_DEFAULT_NAME;
  const appCols = state.app.views[name]?.columns;
  const fileCols = state.file.present.views[name]?.columns;
  const columns: ViewColumn[] = appCols ?? fileCols ?? VIEW_DEFAULT;
  return columns.find((col) => col.field !== 'id' && col.field !== 'links')?.field ?? 'content';
}

export const createReqMiddleware: Middleware<Record<string, never>, CreateReqState> =
  (api) => (next) => (action) => {
    const prevFocus = api.getState().app.focus;
    const result = next(action);

    if (fileCreateNextReq.match(action) || fileCreateChildReq.match(action)) {
      const state = api.getState();
      const newId = state.file.present.focusReqId;
      if (newId != null) {
        const firstEditableField = getFirstEditableField(state);
        api.dispatch(appSetUndoFocus(prevFocus));
        api.dispatch(
          appSetFocus({ id: newId, field: firstEditableField, editable: true, postCreate: true, children: [] }),
        );
      }
    }

    return result;
  };
