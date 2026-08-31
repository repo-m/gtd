import { useRef, useEffect, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { store } from '../../store/store';
import { selectFilteredReqList } from '../../store/fileSliceMemoSelector';
import { fileCreateNextReq } from '../../store/fileSlice';
import { appToggleFocus, appSetFocus, appSetCurrentView, appSetSelection, selectAppCurrentView, selectAppViewMismatches, selectAppSelection, selectAppSelectionAnchor, appOpenViewEditor, selectAppFilters } from '../../store/appSlice';
import { TableCellContent } from './TableCellContent';
import { useTableContextMenu } from './useTableContextMenu';
import { ContextMenu } from '../../components/ContextMenu';
import { FilterPanel } from '../../components/FilterPanel/FilterPanel';
import { FilterIcon } from '../../components/Icon';
import { useColumnResize } from '../../components/Table';
import { VIEW_DEFAULT_NAME } from '../../constants/view_constants';
import { api } from '../../api/api';

export function TableView() {
  const dispatch = useDispatch<AppDispatch>();

  const filteredReqIds = useSelector(selectFilteredReqList);
  const root = useSelector((state: RootState) => state.file.present.root);
  const requirements = useSelector((state: RootState) => state.file.present.requirements);
  const focus = useSelector((state: RootState) => state.app.focus);
  const editMode = useSelector((state: RootState) => state.app.editMode);
  const selection = useSelector(selectAppSelection);
  const selectionAnchor = useSelector(selectAppSelectionAnchor);
  const viewName = useSelector((state: RootState) => state.app.viewName);
  const filepath = useSelector((state: RootState) => state.app.filepath);
  const filters = useSelector(selectAppFilters);

  const columns = useSelector(selectAppCurrentView);
  const { hiddenFromView } = useSelector(selectAppViewMismatches);

  const visibleReqIds = filteredReqIds.filter((id) => id !== root);

  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

  const [openFilter, setOpenFilter] = useState<{ field: string; x: number; y: number } | null>(null);
  const currentFilterTrigger = useRef<HTMLButtonElement | null>(null);
  const closeFilter = useCallback(() => setOpenFilter(null), []);

  const handleFilterClick = (field: string, e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    if (openFilter?.field === field) {
      setOpenFilter(null);
      return;
    }
    const rect = e.currentTarget.getBoundingClientRect();
    currentFilterTrigger.current = e.currentTarget;
    setOpenFilter({ field, x: rect.left, y: rect.bottom + 4 });
  };

  useEffect(() => {
    if (focus?.id != null) {
      const el = rowRefs.current.get(focus.id);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [focus?.id]);

  const getDescendants = (id: number): number[] => {
    const result: number[] = [];
    const stack = [...(requirements[id]?.children ?? [])];
    while (stack.length > 0) {
      const cur = stack.pop()!;
      result.push(cur);
      stack.push(...(requirements[cur]?.children ?? []));
    }
    return result;
  };

  const handleCellClick = (id: number, field: string, e: React.MouseEvent) => {
    const isCtrl = e.metaKey || e.ctrlKey;
    const isShift = e.shiftKey;

    if (isShift) {
      const anchor = selectionAnchor ?? id;
      const anchorIdx = visibleReqIds.indexOf(anchor);
      const targetIdx = visibleReqIds.indexOf(id);
      if (anchorIdx === -1 || targetIdx === -1) {
        dispatch(appSetSelection([id]));
      } else {
        const start = Math.min(anchorIdx, targetIdx);
        const end = Math.max(anchorIdx, targetIdx);
        dispatch(appSetSelection(visibleReqIds.slice(start, end + 1)));
      }
    } else if (isCtrl) {
      const newSelection = selection.includes(id)
        ? selection.filter((s) => s !== id)
        : [...selection, id];
      dispatch(appSetSelection(newSelection));
    } else {
      const index = visibleReqIds.indexOf(id);
      dispatch(appToggleFocus({ id, field, index, children: getDescendants(id) }));
      dispatch(appSetSelection([id]));
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'a' && !focus?.editable) {
        e.preventDefault();
        if (visibleReqIds.length > 0) {
          dispatch(appSetSelection(visibleReqIds));
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [visibleReqIds, dispatch, focus]);

  const handleCellDoubleClick = (id: number, field: string) => {
    if (!editMode) return;
    const index = visibleReqIds.indexOf(id);
    dispatch(appSetFocus({ id, field, editable: true, index, children: getDescendants(id) }));
  };

  const handleFooterDoubleClick = () => {
    dispatch(fileCreateNextReq(undefined));
  };

  const { handleResizeStart } = useColumnResize(
    columns,
    (updatedColumns) => {
      const name = viewName ?? VIEW_DEFAULT_NAME;
      dispatch(appSetCurrentView({ viewName: name, columns: updatedColumns }));
      if (filepath) {
        const views = store.getState().app.views;
        api.saveFileState(filepath, {
          active_view: name,
          views: Object.fromEntries(Object.entries(views).map(([k, v]) => [k, v.columns])),
        });
      }
    },
  );

  const { handleContextMenu, contextMenu } = useTableContextMenu(visibleReqIds, getDescendants);

  const openViewEditor = () => dispatch(appOpenViewEditor());

  const openFilterCol = openFilter ? columns.find((c) => c.field === openFilter.field) : null;

  return (
    <div className="table-scroll-container">
      <table
        className="req-table"
        style={{ width: '100%' }}
      >
        <thead>
          <tr>
            {columns.map((col, i) => {
              const isFilterable = true;
              const isFiltered = Boolean(filters[col.field]);
              return (
                <th
                  key={col.field}
                  className="table-header-cell"
                  style={col.width !== undefined ? { width: col.width } : undefined}
                >
                  {col.label}
                  {isFilterable && (
                    <button
                      className={`filter-icon-btn${isFiltered ? ' is-filtered' : ''}`}
                      onClick={(e) => handleFilterClick(col.field, e)}
                      title={`Filter by ${col.label}`}
                    >
                      <FilterIcon size={12} />
                    </button>
                  )}
                  <div
                    className="resize-handle"
                    onMouseDown={(e) =>
                      handleResizeStart(e, i, (e.currentTarget.parentElement as HTMLElement).offsetWidth)
                    }
                  />
                </th>
              );
            })}
            {hiddenFromView.length > 0 && (
              <th
                className="table-header-cell hidden-fields-badge"
                title={hiddenFromView.join(', ')}
                onClick={openViewEditor}
                style={{ cursor: 'pointer', whiteSpace: 'nowrap' }}
              >
                +{hiddenFromView.length} fields ›
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleReqIds.length === 0 && (
            <tr
              className="table-empty-row"
              onDoubleClick={() => dispatch(fileCreateNextReq(root))}
            >
              <td
                className="table-empty-cell"
                colSpan={columns.length}
              >
                No requirements yet — double-click here or use Add Req to get started.
              </td>
            </tr>
          )}
          {visibleReqIds.map((id) => {
            const req = requirements[id];
            if (!req) return null;
            const isFocusedRow = focus?.id === id;
            const isChildOfFocused = focus?.children.includes(id) ?? false;
            const isSelected = selection.includes(id);
            return (
              <tr
                key={id}
                className={[
                  'table-data-row',
                  isFocusedRow ? 'is-focused-row' : '',
                  isChildOfFocused ? 'is-child-of-focused' : '',
                  isSelected ? 'is-selected-row' : '',
                  req.heading ? 'is-heading-row' : '',
                ].filter(Boolean).join(' ')}
                ref={(el) => {
                  if (el) rowRefs.current.set(id, el);
                  else rowRefs.current.delete(id);
                }}
              >
                {columns.map((col) => {
                  const isFocusedCell = focus?.id === id && focus?.field === col.field;
                  return (
                    <td
                      key={col.field}
                      className={`table-cell${isFocusedCell ? ' is-focused-cell' : ''}`}
                      onClick={(e) => handleCellClick(id, col.field, e)}
                      onDoubleClick={() => handleCellDoubleClick(id, col.field)}
                      onContextMenu={(e) => handleContextMenu(id, col.field, e)}
                    >
                      <TableCellContent id={id} field={col.field} />
                    </td>
                  );
                })}
              </tr>
            );
          })}
        </tbody>
        <tfoot onDoubleClick={handleFooterDoubleClick}>
          <tr>
            <td
              className="table-footer-cell"
              colSpan={columns.length}
            >
              Double-click to add requirement
            </td>
          </tr>
        </tfoot>
      </table>
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          items={contextMenu.items}
          onClose={contextMenu.onClose}
        />
      )}
      {openFilter && openFilterCol && (
        <FilterPanel
          field={openFilter.field}
          fieldDef={openFilterCol.fieldDef}
          x={openFilter.x}
          y={openFilter.y}
          onClose={closeFilter}
          triggerRef={currentFilterTrigger}
        />
      )}
    </div>
  );
}
