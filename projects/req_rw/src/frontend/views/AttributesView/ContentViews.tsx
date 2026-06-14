import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { BUILTIN_FIELDS } from '../../constants/field_constants';
import { FieldDef, NamedViewDef, ViewColumn } from '../../store/file';
import { fileUpdateViews } from '../../store/fileSlice';
import { MenuActions } from './AttributesMenu';
import { VIEW_DEFAULT_NAME } from '../../constants/view_constants';

interface EditableView {
  name: string;
  columns: ViewColumn[];
}

interface ContentViewsProps {
  initialViews: Record<string, NamedViewDef>;
  fields: FieldDef[];
  isActive: boolean;
  stableSetOnSubmit: (fn: () => void) => void;
  stableSetMenuActions: (actions: MenuActions) => void;
}

export function ContentViews({
  initialViews,
  fields,
  isActive,
  stableSetOnSubmit,
  stableSetMenuActions,
}: ContentViewsProps) {
  const dispatch = useDispatch();
  const [views, setViews] = useState<EditableView[]>(() =>
    Object.entries(initialViews).map(([name, def]) => ({ name, columns: def.columns })),
  );
  const [selectedViewIndex, setSelectedViewIndex] = useState<number | null>(null);
  const [selectedColIndex, setSelectedColIndex] = useState<number | null>(null);

  const selectedViewRef = useRef(selectedViewIndex);
  selectedViewRef.current = selectedViewIndex;
  const viewsRef = useRef(views);
  viewsRef.current = views;

  useEffect(() => {
    if (!isActive) return;
    stableSetMenuActions({
      onAdd: () => {
        setViews((prev) => [...prev, { name: 'New View', columns: [] }]);
        setSelectedViewIndex((prev) => (prev === null ? 0 : prev));
      },
      onRemove: () => {
        const idx = selectedViewRef.current;
        if (idx !== null && viewsRef.current[idx].name !== VIEW_DEFAULT_NAME) {
          setViews((prev) => prev.filter((_, i) => i !== idx));
          setSelectedViewIndex(null);
          setSelectedColIndex(null);
        }
      },
    });
    stableSetOnSubmit(() => {
      const record: Record<string, NamedViewDef> = {};
      for (const v of viewsRef.current) {
        record[v.name] = { columns: v.columns };
      }
      dispatch(fileUpdateViews(record));
    });
  }, [isActive, stableSetMenuActions, stableSetOnSubmit, dispatch]);

  const allFieldNames: string[] = [
    ...BUILTIN_FIELDS,
    ...fields.map((f) => f.name),
  ];

  const selectedView = selectedViewIndex !== null ? views[selectedViewIndex] : null;

  function updateViewName(index: number, name: string) {
    setViews((prev) => prev.map((v, i) => (i === index ? { ...v, name } : v)));
  }

  function updateColumn(viewIndex: number, colIndex: number, patch: Partial<ViewColumn>) {
    setViews((prev) =>
      prev.map((v, vi) =>
        vi !== viewIndex
          ? v
          : { ...v, columns: v.columns.map((c, ci) => (ci === colIndex ? { ...c, ...patch } : c)) },
      ),
    );
  }

  function addColumn(viewIndex: number) {
    setViews((prev) =>
      prev.map((v, vi) =>
        vi !== viewIndex
          ? v
          : { ...v, columns: [...v.columns, { field: '', label: '' }] },
      ),
    );
  }

  function removeColumn(viewIndex: number, colIndex: number) {
    setViews((prev) =>
      prev.map((v, vi) =>
        vi !== viewIndex
          ? v
          : { ...v, columns: v.columns.filter((_, ci) => ci !== colIndex) },
      ),
    );
    setSelectedColIndex(null);
  }

  function moveColumn(viewIndex: number, colIndex: number, direction: -1 | 1) {
    const target = colIndex + direction;
    setViews((prev) =>
      prev.map((v, vi) => {
        if (vi !== viewIndex) return v;
        const cols = [...v.columns];
        if (target < 0 || target >= cols.length) return v;
        [cols[colIndex], cols[target]] = [cols[target], cols[colIndex]];
        return { ...v, columns: cols };
      }),
    );
    setSelectedColIndex(target);
  }

  return (
    <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
      {/* Views list */}
      <div
        style={{
          width: 180,
          borderRight: '1px solid var(--color-border)',
          overflowY: 'auto',
          padding: '8px 0',
        }}
      >
        {views.map((view, index) => (
          <div
            key={index}
            onClick={() => {
              setSelectedViewIndex(index);
              setSelectedColIndex(null);
            }}
            style={{
              padding: '4px 12px',
              cursor: 'pointer',
              background: selectedViewIndex === index ? 'var(--color-bg-selected)' : 'transparent',
              fontSize: 13,
            }}
          >
            <input
              style={{
                border: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: 13,
                cursor: 'pointer',
                outline: 'none',
              }}
              value={view.name}
              onChange={(e) => updateViewName(index, e.target.value)}
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        ))}
        {views.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12, padding: 8 }}>No views defined.</div>
        )}
      </div>

      {/* Columns editor */}
      {selectedView !== null && selectedViewIndex !== null && (
        <div style={{ flex: 1, padding: 12, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 13, fontWeight: 'bold' }}>Columns</span>
            <button onClick={() => addColumn(selectedViewIndex)} style={smBtnStyle}>
              + Add Column
            </button>
          </div>
          <div style={{ display: 'flex', gap: 4, fontSize: 11, color: 'var(--color-text-muted)', fontWeight: 'bold' }}>
            <span style={{ flex: 2 }}>Field</span>
            <span style={{ flex: 2 }}>Label</span>
            <span style={{ flex: 1 }}>Width</span>
            <span style={{ width: 80 }}>Actions</span>
          </div>
          {selectedView.columns.map((col, colIndex) => (
            <div
              key={colIndex}
              onClick={() => setSelectedColIndex(colIndex)}
              style={{
                display: 'flex',
                gap: 4,
                alignItems: 'center',
                background: selectedColIndex === colIndex ? 'var(--color-bg-selected)' : colIndex % 2 === 0 ? 'var(--color-bg-subtle)' : 'var(--color-bg)',
                borderRadius: 2,
                cursor: 'pointer',
              }}
            >
              <input
                list="field-options"
                style={{ ...colInputStyle, flex: 2 }}
                value={col.field}
                onChange={(e) => updateColumn(selectedViewIndex, colIndex, { field: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="field name"
              />
              <datalist id="field-options">
                {allFieldNames.map((f) => (
                  <option key={f} value={f} />
                ))}
              </datalist>
              <input
                style={{ ...colInputStyle, flex: 2 }}
                value={col.label}
                onChange={(e) => updateColumn(selectedViewIndex, colIndex, { label: e.target.value })}
                onClick={(e) => e.stopPropagation()}
                placeholder="label"
              />
              <input
                type="number"
                style={{ ...colInputStyle, flex: 1 }}
                value={col.width ?? ''}
                onChange={(e) =>
                  updateColumn(selectedViewIndex, colIndex, {
                    width: e.target.value === '' ? undefined : Number(e.target.value),
                  })
                }
                onClick={(e) => e.stopPropagation()}
                placeholder="width"
              />
              <div style={{ width: 80, display: 'flex', gap: 2 }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveColumn(selectedViewIndex, colIndex, -1);
                  }}
                  style={smBtnStyle}
                  disabled={colIndex === 0}
                >
                  ↑
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    moveColumn(selectedViewIndex, colIndex, 1);
                  }}
                  style={smBtnStyle}
                  disabled={colIndex === selectedView.columns.length - 1}
                >
                  ↓
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeColumn(selectedViewIndex, colIndex);
                  }}
                  style={{ ...smBtnStyle, color: 'var(--color-error)' }}
                >
                  ×
                </button>
              </div>
            </div>
          ))}
          {selectedView.columns.length === 0 && (
            <div style={{ color: 'var(--color-text-muted)', fontSize: 12 }}>No columns. Click "+ Add Column" to add one.</div>
          )}
        </div>
      )}
      {selectedView === null && (
        <div style={{ flex: 1, padding: 16, color: 'var(--color-text-muted)', fontSize: 13 }}>
          Select a view to edit its columns.
        </div>
      )}
    </div>
  );
}

const smBtnStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 11,
  cursor: 'pointer',
  border: '1px solid var(--color-border)',
  borderRadius: 2,
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
};

const colInputStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 12,
  border: '1px solid var(--color-border)',
  borderRadius: 2,
  boxSizing: 'border-box',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
};
