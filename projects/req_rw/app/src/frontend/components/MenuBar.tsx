import { useState, useEffect, useRef, useContext } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appOpenAttributes,
  appOpenViewEditor,
  appSetContentMode,
  appSetEditMode,
  appSetError,
  appClearError,
  appToggleSidebar,
  appSetViewName,
  appSetTheme,
  selectAppSidebar,
  selectAppTheme,
  ContentMode,
  ThemeSetting,
} from '../store/appSlice';
import { VIEW_DEFAULT_NAME } from '../constants/view_constants';
import {
  fileCreateNextReq,
  fileCreateChildReq,
  fileDeleteReq,
  fileUndo,
  fileRedo,
  selectFileCanUndo,
  selectFileCanRedo,
} from '../store/fileSlice';
import { searchSetVisible, searchSetValue, searchMoveIndex, searchStart } from '../store/searchSlice';
import { entryDataSearch } from './MenuBar/menuBarData/entryDataSearch';
import type { RootState } from '../store/store';
import { api } from '../api/api';
import { FORMAT_TEXT_COMMAND } from 'lexical';
import { INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND } from '@lexical/list';
import { GlobalEditorContext } from './GlobalEditorContext';
import {
  SunIcon,
  MoonIcon,
  MonitorIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BoldIcon,
  ItalicIcon,
  UnderlineIcon,
  ListOrderedIcon,
  ListUnorderedIcon,
} from './Icon';

type Tab = 'File' | 'Home' | 'View';

const VIEW_MODES: { label: string; mode: ContentMode; title: string }[] = [
  { label: 'Table', mode: 'TABLE', title: 'Table View' },
  { label: 'Raw', mode: 'RAW', title: 'Raw JSON View' },
  { label: 'File', mode: 'FILE', title: 'File View' },
  { label: 'ReqIF', mode: 'REGIF', title: 'ReqIF View' },
];

export function MenuBar() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState<Tab>('Home');

  const isVisible = useSelector((state: RootState) => state.search.isVisible);
  const value = useSelector((state: RootState) => state.search.value);
  const count = useSelector((state: RootState) => state.search.count);
  const index = useSelector((state: RootState) => state.search.index);
  const contentMode = useSelector((state: RootState) => state.app.contentMode);
  const focus = useSelector((state: RootState) => state.app.focus);
  const sidebar = useSelector(selectAppSidebar);
  const editMode = useSelector((state: RootState) => state.app.editMode);
  const theme = useSelector(selectAppTheme);
  const viewName = useSelector((state: RootState) => state.app.viewName);
  const appViews = useSelector((state: RootState) => state.app.views);
  const viewNames = [VIEW_DEFAULT_NAME, ...Object.keys(appViews).filter((k) => k !== VIEW_DEFAULT_NAME)];

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isVisible) inputRef.current?.focus();
  }, [isVisible]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        dispatch(searchSetVisible(true));
      }
      if (e.key === 'Escape' && isVisible) {
        dispatch(searchSetVisible(false));
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [dispatch, isVisible]);

  const canUndo = useSelector(selectFileCanUndo);
  const canRedo = useSelector(selectFileCanRedo);

  const focusId = focus?.id;
  const { activeEditorRef } = useContext(GlobalEditorContext);

  const themeIcon = theme === 'light' ? <SunIcon /> : theme === 'dark' ? <MoonIcon /> : <MonitorIcon />;
  const themeTitle = theme === 'light' ? 'Theme: Light' : theme === 'dark' ? 'Theme: Dark' : 'Theme: System';

  return (
    <div className="menu-bar">
      <div className="menu-tab-row">
        {(['File', 'Home', 'View'] as Tab[]).map((tab) => (
          <button
            key={tab}
            className={`menu-tab${activeTab === tab ? ' is-active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'View' && (
        <div className="menu-content-row">
          <label className="menu-view-label">View:</label>
          <select
            value={viewName ?? VIEW_DEFAULT_NAME}
            onChange={(e) => dispatch(appSetViewName(e.target.value))}
            className="menu-view-select"
          >
            {viewNames.map((name) => (
              <option key={name} value={name}>{name}</option>
            ))}
          </select>
          <button className="menu-btn" title="Edit Named View" onClick={() => dispatch(appOpenViewEditor())}>
            Edit View
          </button>
        </div>
      )}

      {activeTab === 'File' && (
        <div className="menu-content-row">
          <button className="menu-btn" title="New" onClick={() => { const r = api.new(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>New</button>
          <button className="menu-btn" title="Open" onClick={async () => { const r = await api.open(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>Open</button>
          <button className="menu-btn" title="Save" onClick={async () => { const r = await api.save(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>Save</button>
          <button className="menu-btn" title="Save As" onClick={async () => { const r = await api.saveAs(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>Save As</button>
          <span className="menu-sep" />
          <button className="menu-btn" title="Export ReqIF" onClick={async () => { const r = await api.exportReqIf(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>Export ReqIF</button>
          <button className="menu-btn" title="Import ReqIF" onClick={async () => { const r = await api.importReqIf(); dispatch(r.ok ? appClearError() : appSetError(r.error!)); }}>Import ReqIF</button>
          <span className="menu-sep" />
          <button className="menu-btn" title="Edit Attributes" onClick={() => dispatch(appOpenAttributes())}>Edit Attributes</button>
        </div>
      )}

      {activeTab === 'Home' && (
        <>
          <div className="menu-content-row">
            {/* History */}
            <button className="menu-btn" disabled={!canUndo} title="Undo (Ctrl+Z)" onClick={() => dispatch(fileUndo())}>Undo</button>
            <button className="menu-btn" disabled={!canRedo} title="Redo (Ctrl+Y)" onClick={() => dispatch(fileRedo())}>Redo</button>
            <span className="menu-sep" />
            {/* Clipboard */}
            <button
              className="menu-btn"
              disabled={focusId === undefined}
              title="Copy (Ctrl+C)"
              onClick={async () => { if (focusId !== undefined) { const r = await api.copy(focusId, false); dispatch(r.ok ? appClearError() : appSetError(r.error!)); } }}
            >
              Copy
            </button>
            <button
              className="menu-btn"
              disabled={focusId === undefined}
              title="Cut (Ctrl+X)"
              onClick={async () => { if (focusId !== undefined) { const r = await api.cut(focusId); dispatch(r.ok ? appClearError() : appSetError(r.error!)); } }}
            >
              Cut
            </button>
            <button
              className="menu-btn"
              disabled={focusId === undefined}
              title="Paste (Ctrl+V)"
              onClick={async () => { if (focusId !== undefined) { const r = await api.paste(focusId, false); dispatch(r.ok ? appClearError() : appSetError(r.error!)); } }}
            >
              Paste
            </button>
            <span className="menu-sep" />
            {/* Format */}
            <button
              className="menu-btn menu-btn--icon"
              aria-label="Bold"
              title="Bold (Ctrl+B)"
              onClick={() => activeEditorRef.current?.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}
            >
              <BoldIcon />
            </button>
            <button
              className="menu-btn menu-btn--icon"
              aria-label="Italic"
              title="Italic (Ctrl+I)"
              onClick={() => activeEditorRef.current?.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
            >
              <ItalicIcon />
            </button>
            <button
              className="menu-btn menu-btn--icon"
              aria-label="Underline"
              title="Underline (Ctrl+U)"
              onClick={() => activeEditorRef.current?.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
            >
              <UnderlineIcon />
            </button>
            <button
              className="menu-btn menu-btn--icon"
              aria-label="Ordered list"
              title="Ordered List"
              onClick={() => activeEditorRef.current?.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
            >
              <ListOrderedIcon />
            </button>
            <button
              className="menu-btn menu-btn--icon"
              aria-label="Unordered list"
              title="Unordered List"
              onClick={() => activeEditorRef.current?.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
            >
              <ListUnorderedIcon />
            </button>
            <span className="menu-sep" />
            {/* Structure */}
            <button className="menu-btn" disabled={focusId === undefined} title="Add Requirement" onClick={() => focusId !== undefined && dispatch(fileCreateNextReq(focusId))}>Add Req</button>
            <button className="menu-btn" disabled={focusId === undefined} title="Add Child Requirement" onClick={() => focusId !== undefined && dispatch(fileCreateChildReq(focusId))}>Add Child</button>
            <button className="menu-btn" disabled={focusId === undefined} title="Delete Requirement" onClick={() => focusId !== undefined && dispatch(fileDeleteReq(focusId))}>Delete Req</button>
            <span className="menu-sep" />
            {/* View mode */}
            {VIEW_MODES.map(({ label, mode, title }) => (
              <button
                key={mode}
                className={`menu-btn${contentMode === mode ? ' is-active' : ''}`}
                title={title}
                onClick={() => { dispatch(appSetContentMode(mode)); dispatch(searchStart()); }}
              >
                {label}
              </button>
            ))}
            <span className="menu-sep" />
            {/* Panels */}
            <button
              className={`menu-btn${sidebar ? ' is-active' : ''}`}
              onClick={() => dispatch(appToggleSidebar())}
              title="Toggle Sidebar"
            >
              Sidebar
            </button>
            <button
              className={`menu-btn${editMode ? ' is-active' : ''}`}
              onClick={() => dispatch(appSetEditMode(!editMode))}
              title="Toggle Edit Mode"
            >
              Edit
            </button>
            <span className="menu-sep" />
            {/* Search toggle */}
            <button
              className={`menu-btn${isVisible ? ' is-active' : ''}`}
              onClick={() => dispatch(searchSetVisible(!isVisible))}
              title="Search (Ctrl+F)"
            >
              {entryDataSearch.label}
            </button>
            <span className="menu-sep" />
            {/* Preferences: theme */}
            <button
              className="menu-btn"
              onClick={() => {
                const cycle: ThemeSetting[] = ['light', 'dark', 'system'];
                dispatch(appSetTheme(cycle[(cycle.indexOf(theme) + 1) % 3]));
              }}
              title={themeTitle}
              aria-label={themeTitle}
            >
              {themeIcon}
            </button>
          </div>

          {isVisible && (
            <div className="menu-search-row">
              <input
                ref={inputRef}
                type="text"
                value={value}
                onChange={(e) => dispatch(searchSetValue(e.target.value))}
                placeholder={entryDataSearch.placeholder}
                className="menu-search-input"
              />
              <span className="menu-search-count">
                {count > 0 ? `${index + 1}/${count}` : '0/0'}
              </span>
              {value.length > 0 && count === 0 && (
                <span className="menu-no-matches">No matches</span>
              )}
              <button className="menu-btn" onClick={() => dispatch(searchMoveIndex(false))} title={entryDataSearch.prevTitle}>
                <ChevronLeftIcon />
              </button>
              <button className="menu-btn" onClick={() => dispatch(searchMoveIndex(true))} title={entryDataSearch.nextTitle}>
                <ChevronRightIcon />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
