import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import type { FieldDef } from '../../store/file';
import type { EnumFilter, TextFilter } from '../../store/appSlice';
import { appSetFilter, appClearFilter, selectAppFilters } from '../../store/appSlice';

interface FilterPanelProps {
  field: string;
  fieldDef: FieldDef | null;
  x: number;
  y: number;
  onClose: () => void;
  triggerRef: React.MutableRefObject<HTMLButtonElement | null>;
}

const BOOLEAN_VALUES = ['', 'true', 'false'];

export function FilterPanel({ field, fieldDef, x, y, onClose, triggerRef }: FilterPanelProps) {
  const dispatch = useDispatch<AppDispatch>();
  const panelRef = useRef<HTMLDivElement>(null);
  const filters = useSelector(selectAppFilters);
  const activeFilter = filters[field];

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    const handleMouseDown = (e: MouseEvent) => {
      if (
        panelRef.current && !panelRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleMouseDown);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, [onClose, triggerRef]);

  const style: React.CSSProperties = { position: 'fixed', top: y, left: x };

  const useCheckboxVariant =
    fieldDef?.type === 'Enumeration' || fieldDef?.type === 'Boolean';

  if (useCheckboxVariant) {
    const allValues =
      fieldDef?.type === 'Boolean'
        ? BOOLEAN_VALUES
        : ['', ...(fieldDef?.values ?? [])];
    const filter = activeFilter as EnumFilter | undefined;
    const checkedSet = filter == null ? new Set(allValues) : new Set(filter.include);

    const handleCheck = (value: string, checked: boolean) => {
      const next = new Set(checkedSet);
      if (checked) next.add(value);
      else next.delete(value);
      if (next.size === allValues.length) {
        dispatch(appClearFilter(field));
      } else {
        dispatch(appSetFilter({ field, filter: { type: 'enum', include: [...next] } }));
      }
    };

    return (
      <div ref={panelRef} className="filter-panel" style={style}>
        <div className="filter-panel__title">Filter: {field}</div>
        <div className="filter-panel__options">
          {allValues.map((v) => (
            <label key={v} className="filter-panel__option">
              <input
                type="checkbox"
                checked={checkedSet.has(v)}
                onChange={(e) => handleCheck(v, e.target.checked)}
              />
              {v === '' ? '(blank)' : v}
            </label>
          ))}
        </div>
        <div className="filter-panel__actions">
          <button
            className="filter-panel__action-btn"
            onClick={() => dispatch(appClearFilter(field))}
          >
            Select All
          </button>
          <button
            className="filter-panel__action-btn"
            onClick={() => dispatch(appSetFilter({ field, filter: { type: 'enum', include: [] } }))}
          >
            Clear All
          </button>
        </div>
      </div>
    );
  }

  const filter = activeFilter as TextFilter | undefined;
  const value = filter?.value ?? '';

  return (
    <div ref={panelRef} className="filter-panel" style={style}>
      <div className="filter-panel__title">Filter: {field}</div>
      <div className="filter-panel__string">
        <input
          className="filter-panel__text-input"
          type="text"
          placeholder="Contains…"
          value={value}
          onChange={(e) => {
            const v = e.target.value;
            if (v === '') dispatch(appClearFilter(field));
            else dispatch(appSetFilter({ field, filter: { type: 'text', value: v } }));
          }}
          autoFocus
        />
      </div>
    </div>
  );
}
