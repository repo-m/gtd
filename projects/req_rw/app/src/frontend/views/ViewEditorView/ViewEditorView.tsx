import { useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../components/Modal/Modal';
import {
  appCloseViewEditor,
  appAddView,
  appRenameView,
  appDeleteView,
  appSetViewName,
  appSetCurrentView,
} from '../../store/appSlice';
import type { RootState } from '../../store/store';
import { store } from '../../store/store';
import { VIEW_DEFAULT, VIEW_DEFAULT_NAME } from '../../constants/view_constants';
import type { ViewColumn } from '../../store/file';
import { api } from '../../api/api';

const BUILTIN_COLUMNS: ViewColumn[] = [
  { field: 'id', label: 'ID' },
  { field: 'content', label: 'Requirements' },
  { field: 'links', label: 'Links' },
];

type NamingMode = 'new' | 'rename' | null;

export function ViewEditorView() {
  const dispatch = useDispatch();
  const viewName = useSelector((state: RootState) => state.app.viewName);
  const appViews = useSelector((state: RootState) => state.app.views);
  const customFields = useSelector((state: RootState) => state.file.present.fields);
  const filepath = useSelector((state: RootState) => state.app.filepath);

  const [namingMode, setNamingMode] = useState<NamingMode>(null);
  const [namingValue, setNamingValue] = useState('');
  const [addColumnOpen, setAddColumnOpen] = useState(false);
  const namingInputRef = useRef<HTMLInputElement>(null);

  const currentName = viewName ?? VIEW_DEFAULT_NAME;
  const allViewNames = [VIEW_DEFAULT_NAME, ...Object.keys(appViews).filter((k) => k !== VIEW_DEFAULT_NAME)];
  const columns: ViewColumn[] = appViews[currentName]?.columns ?? VIEW_DEFAULT;

  function savePrefs(name: string) {
    if (!filepath) return;
    const appState = store.getState().app;
    api.saveFileState(filepath, {
      active_view: name,
      views: Object.fromEntries(Object.entries(appState.views).map(([k, v]) => [k, v.columns])),
    });
  }

  function setColumns(updated: ViewColumn[]) {
    dispatch(appSetCurrentView({ viewName: currentName, columns: updated }));
    savePrefs(currentName);
  }

  function moveUp(i: number) {
    if (i === 0) return;
    const next = [...columns];
    [next[i - 1], next[i]] = [next[i], next[i - 1]];
    setColumns(next);
  }

  function moveDown(i: number) {
    if (i === columns.length - 1) return;
    const next = [...columns];
    [next[i], next[i + 1]] = [next[i + 1], next[i]];
    setColumns(next);
  }

  function updateLabel(i: number, label: string) {
    setColumns(columns.map((c, ci) => (ci === i ? { ...c, label } : c)));
  }

  function removeColumn(i: number) {
    setColumns(columns.filter((_, ci) => ci !== i));
  }

  function addColumn(field: string, label: string) {
    setColumns([...columns, { field, label }]);
    setAddColumnOpen(false);
  }

  function startNaming(mode: 'new' | 'rename') {
    setNamingValue(mode === 'rename' ? currentName : '');
    setNamingMode(mode);
    setTimeout(() => namingInputRef.current?.focus(), 0);
  }

  function confirmNaming() {
    const name = namingValue.trim();
    if (!name) { cancelNaming(); return; }

    if (namingMode === 'new') {
      dispatch(appAddView(name));
      setTimeout(() => savePrefs(name), 0);
    } else if (namingMode === 'rename') {
      dispatch(appRenameView({ from: currentName, to: name }));
      setTimeout(() => savePrefs(name), 0);
    }
    setNamingMode(null);
  }

  function cancelNaming() {
    setNamingMode(null);
  }

  function handleDelete() {
    if (currentName === VIEW_DEFAULT_NAME) return;
    if (!window.confirm(`Delete view "${currentName}"?`)) return;
    dispatch(appDeleteView(currentName));
    savePrefs(VIEW_DEFAULT_NAME);
  }

  function handleViewChange(name: string) {
    dispatch(appSetViewName(name));
    savePrefs(name);
  }

  const usedFields = new Set(columns.map((c) => c.field));
  const availableColumns: ViewColumn[] = [
    ...BUILTIN_COLUMNS.filter((c) => !usedFields.has(c.field)),
    ...customFields
      .filter((f) => !usedFields.has(f.name))
      .map((f) => ({ field: f.name, label: f.name })),
  ];

  return (
    <Modal title="Edit View" onClose={() => dispatch(appCloseViewEditor())}>
      {/* Named view bar */}
      <div style={viewBarStyle}>
        {namingMode ? (
          <>
            <input
              ref={namingInputRef}
              style={namingInputStyle}
              value={namingValue}
              onChange={(e) => setNamingValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') confirmNaming();
                if (e.key === 'Escape') cancelNaming();
              }}
              placeholder={namingMode === 'new' ? 'New view name…' : 'Rename to…'}
            />
            <button className="btn" onClick={confirmNaming}>OK</button>
            <button className="btn" onClick={cancelNaming}>Cancel</button>
          </>
        ) : (
          <>
            <select
              style={viewSelectStyle}
              value={currentName}
              onChange={(e) => handleViewChange(e.target.value)}
            >
              {allViewNames.map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button className="btn" onClick={() => startNaming('new')}>+ New</button>
            <button className="btn" onClick={() => startNaming('rename')}>Rename</button>
            <button
              className="btn"
              disabled={currentName === VIEW_DEFAULT_NAME}
              onClick={handleDelete}
            >
              Delete
            </button>
          </>
        )}
      </div>

      <hr style={{ margin: 0, borderColor: 'var(--color-border)', borderStyle: 'solid', borderWidth: '1px 0 0 0' }} />

      {/* Column list header */}
      <div style={{ display: 'flex', alignItems: 'center', padding: '8px 12px 4px' }}>
        <span style={sectionTitleStyle}>Columns</span>
        <div style={{ marginLeft: 'auto', position: 'relative' }}>
          <button className="btn" onClick={() => setAddColumnOpen((v) => !v)}>
            + Column
          </button>
          {addColumnOpen && (
            <div style={dropdownStyle}>
              {availableColumns.length === 0 ? (
                <div style={dropdownEmptyStyle}>All fields are visible.</div>
              ) : (
                availableColumns.map((col) => (
                  <div
                    key={col.field}
                    style={dropdownItemStyle}
                    onClick={() => addColumn(col.field, col.label)}
                  >
                    {col.label} <span style={{ color: 'var(--color-text-muted)', fontSize: 11 }}>({col.field})</span>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* Column list */}
      <div style={{ overflowY: 'auto', flex: 1, padding: '0 12px', minHeight: 0 }}>
        {columns.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12, padding: '8px 0' }}>
            No columns — click + Column to add one.
          </div>
        )}

        {/* Column header row */}
        {columns.length > 0 && (
          <div style={{ ...colRowStyle, fontWeight: 'bold', fontSize: 11, color: 'var(--color-text-muted)', paddingBottom: 4, borderBottom: '1px solid var(--color-border)' }}>
            <span style={{ width: 48, flexShrink: 0 }}></span>
            <span style={{ flex: 2 }}>Label</span>
            <span style={{ flex: 2 }}>Field</span>
            <span style={{ width: 28, flexShrink: 0 }}></span>
          </div>
        )}

        {columns.map((col, i) => (
          <div key={i} style={{ ...colRowStyle, borderBottom: '1px solid var(--color-border)' }}>
            <div style={{ width: 48, flexShrink: 0, display: 'flex', gap: 2 }}>
              <button className="btn btn--icon" disabled={i === 0} onClick={() => moveUp(i)}>↑</button>
              <button className="btn btn--icon" disabled={i === columns.length - 1} onClick={() => moveDown(i)}>↓</button>
            </div>
            <input
              style={{ ...colInputStyle, flex: 2 }}
              value={col.label}
              onChange={(e) => updateLabel(i, e.target.value)}
            />
            <span style={{ flex: 2, fontSize: 12, color: 'var(--color-text-muted)', paddingLeft: 8, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {col.field}
            </span>
            <div style={{ width: 28, flexShrink: 0, display: 'flex', justifyContent: 'center' }}>
              <button className="btn btn--icon" onClick={() => removeColumn(i)}>✕</button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={footerStyle}>
        <button
          className="btn btn--lg"
          onClick={() => dispatch(appCloseViewEditor())}
        >
          Close
        </button>
      </div>
    </Modal>
  );
}

const viewBarStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '8px 12px',
};

const viewSelectStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '2px 6px',
  border: '1px solid var(--color-border)',
  borderRadius: 3,
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  minWidth: 140,
};

const namingInputStyle: React.CSSProperties = {
  fontSize: 12,
  padding: '2px 6px',
  border: '1px solid var(--color-border)',
  borderRadius: 3,
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  minWidth: 160,
};


const sectionTitleStyle: React.CSSProperties = {
  fontSize: 12,
  fontWeight: 'bold',
  color: 'var(--color-text-muted)',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

const dropdownStyle: React.CSSProperties = {
  position: 'absolute',
  right: 0,
  top: '100%',
  marginTop: 2,
  background: 'var(--color-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 4,
  boxShadow: 'var(--shadow-popover)',
  zIndex: 2000,
  minWidth: 200,
  maxHeight: 240,
  overflowY: 'auto',
};

const dropdownItemStyle: React.CSSProperties = {
  padding: '6px 12px',
  fontSize: 12,
  cursor: 'pointer',
  color: 'var(--color-text)',
};

const dropdownEmptyStyle: React.CSSProperties = {
  padding: '8px 12px',
  fontSize: 12,
  color: 'var(--color-text-muted)',
};

const colRowStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  padding: '4px 0',
};


const colInputStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 12,
  border: '1px solid var(--color-border)',
  borderRadius: 2,
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
};


const footerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'flex-end',
  padding: '10px 12px',
  borderTop: '1px solid var(--color-border)',
};

