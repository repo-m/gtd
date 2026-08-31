import { Fragment, useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { FIELD_TYPES, FieldType } from '../../constants/field_constants';
import { FieldDef } from '../../store/file';
import { fileUpdate } from '../../store/fileSlice';
import { MenuActions } from './AttributesMenu';

interface ContentFieldsProps {
  initialFields: FieldDef[];
  isActive: boolean;
  stableSetOnSubmit: (fn: () => void) => void;
  stableSetMenuActions: (actions: MenuActions) => void;
}

export function ContentFields({
  initialFields,
  isActive,
  stableSetOnSubmit,
  stableSetMenuActions,
}: ContentFieldsProps) {
  const dispatch = useDispatch();
  const [fields, setFields] = useState<FieldDef[]>(initialFields);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedIndexRef = useRef(selectedIndex);
  selectedIndexRef.current = selectedIndex;

  useEffect(() => {
    if (!isActive) return;
    stableSetMenuActions({
      onAdd: () =>
        setFields((prev) => [
          ...prev,
          { name: 'NewField', type: 'String' as FieldType, editable: true },
        ]),
      onRemove: () => {
        const idx = selectedIndexRef.current;
        if (idx !== null) {
          setFields((prev) => prev.filter((_, i) => i !== idx));
          setSelectedIndex(null);
        }
      },
    });
    stableSetOnSubmit(() => {
      dispatch(fileUpdate({ fields: fieldsRef.current }));
    });
  }, [isActive, stableSetMenuActions, stableSetOnSubmit, dispatch]);

  const fieldsRef = useRef(fields);
  fieldsRef.current = fields;

  function updateField(index: number, patch: Partial<FieldDef>) {
    setFields((prev) => prev.map((f, i) => (i === index ? { ...f, ...patch } : f)));
  }

  function updateValue(fieldIndex: number, valueIndex: number, text: string) {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        const values = [...(f.values ?? [])];
        values[valueIndex] = text;
        return { ...f, values };
      }),
    );
  }

  function removeValue(fieldIndex: number, valueIndex: number) {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        return { ...f, values: (f.values ?? []).filter((_, vi) => vi !== valueIndex) };
      }),
    );
  }

  function addValue(fieldIndex: number) {
    setFields((prev) =>
      prev.map((f, i) => {
        if (i !== fieldIndex) return f;
        return { ...f, values: [...(f.values ?? []), ''] };
      }),
    );
  }

  return (
    <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={headerRowStyle}>
        <span style={{ flex: 2 }}>Name</span>
        <span style={{ flex: 1 }}>Type</span>
        <span style={{ flex: 1 }}>Editable</span>
      </div>
      <div style={{ overflowY: 'auto', maxHeight: 340 }}>
        {fields.map((field, index) => (
          <Fragment key={index}>
            <div
              onClick={() => setSelectedIndex(index)}
              style={{
                ...rowStyle,
                background:
                  selectedIndex === index
                    ? 'var(--color-bg-selected)'
                    : index % 2 === 0
                      ? 'var(--color-bg-subtle)'
                      : 'var(--color-bg)',
              }}
            >
              <input
                style={{ ...cellInputStyle, flex: 2 }}
                value={field.name}
                onChange={(e) => updateField(index, { name: e.target.value })}
                onClick={(e) => e.stopPropagation()}
              />
              <select
                style={{ ...cellInputStyle, flex: 1 }}
                value={field.type}
                onChange={(e) => updateField(index, { type: e.target.value as FieldType })}
                onClick={(e) => e.stopPropagation()}
              >
                {FIELD_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
              <div style={{ flex: 1, display: 'flex', alignItems: 'center', paddingLeft: 8 }}>
                <input
                  type="checkbox"
                  checked={field.editable}
                  onChange={(e) => updateField(index, { editable: e.target.checked })}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>

            {selectedIndex === index && field.type === 'Enumeration' && (
              <div style={accordionStyle}>
                <div style={accordionHeaderStyle}>Values</div>
                {(field.values ?? []).map((val, vi) => (
                  <div key={vi} style={{ display: 'flex', gap: 4, marginBottom: 3 }}>
                    <input
                      style={{ ...cellInputStyle, flex: 1 }}
                      value={val}
                      onChange={(e) => updateValue(index, vi, e.target.value)}
                    />
                    <button className="btn btn--icon" onClick={() => removeValue(index, vi)}>
                      ✕
                    </button>
                  </div>
                ))}
                <button className="btn" onClick={() => addValue(index)}>
                  + Add value
                </button>
              </div>
            )}
          </Fragment>
        ))}
        {fields.length === 0 && (
          <div style={{ color: 'var(--color-text-muted)', fontSize: 12, padding: 8 }}>
            No custom fields defined.
          </div>
        )}
      </div>
    </div>
  );
}

const headerRowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  fontWeight: 'bold',
  fontSize: 12,
  color: 'var(--color-text-muted)',
  paddingBottom: 4,
  borderBottom: '1px solid var(--color-border)',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  alignItems: 'center',
  padding: '3px 0',
  cursor: 'pointer',
  borderRadius: 2,
};

const cellInputStyle: React.CSSProperties = {
  padding: '2px 6px',
  fontSize: 12,
  border: '1px solid var(--color-border)',
  borderRadius: 2,
  width: '100%',
  background: 'var(--color-bg)',
  color: 'var(--color-text)',
  boxSizing: 'border-box',
};

const accordionStyle: React.CSSProperties = {
  borderLeft: '3px solid var(--color-accent)',
  marginLeft: 12,
  marginBottom: 4,
  padding: '8px 10px',
  background: 'var(--color-bg-subtle)',
};

const accordionHeaderStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 'bold',
  color: 'var(--color-text-muted)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
};

