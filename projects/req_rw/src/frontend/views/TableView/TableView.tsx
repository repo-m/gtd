import { useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../../store/store';
import { selectFileReqList } from '../../store/fileSliceMemoSelector';
import { fileCreateNextReq } from '../../store/fileSlice';
import { appToggleFocus, appSetFocus, appSetCurrentView, selectAppCurrentView } from '../../store/appSlice';
import { TableCellContent } from './TableCellContent';
import { useTableContextMenu } from './useTableContextMenu';
import { ContextMenu } from '../../components/ContextMenu';
import { useColumnResize } from '../../components/Table';
import { VIEW_DEFAULT_NAME } from '../../constants/view_constants';

export function TableView() {
  const dispatch = useDispatch<AppDispatch>();

  const reqIds = useSelector(selectFileReqList);
  const root = useSelector((state: RootState) => state.file.present.root);
  const requirements = useSelector((state: RootState) => state.file.present.requirements);
  const focus = useSelector((state: RootState) => state.app.focus);
  const editMode = useSelector((state: RootState) => state.app.editMode);
  const viewName = useSelector((state: RootState) => state.app.viewName);

  const columns = useSelector(selectAppCurrentView);

  const visibleReqIds = reqIds.filter((id) => id !== root);

  const rowRefs = useRef<Map<number, HTMLTableRowElement>>(new Map());

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

  const handleCellClick = (id: number, field: string) => {
    const index = visibleReqIds.indexOf(id);
    dispatch(appToggleFocus({ id, field, index, children: getDescendants(id) }));
  };

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
    (updatedColumns) =>
      dispatch(appSetCurrentView({ viewName: viewName ?? VIEW_DEFAULT_NAME, columns: updatedColumns })),
  );

  const { handleContextMenu, contextMenu } = useTableContextMenu(visibleReqIds, getDescendants);

  const tableWidth = columns.reduce((sum, c) => sum + (c.width ?? 100), 0);

  return (
    <div style={{ overflow: 'auto', flex: 1 }}>
      <table
        style={{
          borderCollapse: 'collapse',
          tableLayout: 'fixed',
          width: tableWidth,
        }}
      >
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th
                key={col.field}
                style={{
                  width: col.width,
                  position: 'relative',
                  borderBottom: '2px solid var(--color-border)',
                  textAlign: 'left',
                  padding: '4px 8px',
                  background: 'var(--color-bg-subtle)',
                  color: 'var(--color-text)',
                  userSelect: 'none',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                }}
              >
                {col.label}
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 0,
                    bottom: 0,
                    width: 5,
                    cursor: 'col-resize',
                    background: 'rgba(0,0,0,0.08)',
                  }}
                  onMouseDown={(e) => handleResizeStart(e, i)}
                />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleReqIds.length === 0 && (
            <tr
              onDoubleClick={() => dispatch(fileCreateNextReq(root))}
              style={{ cursor: 'default' }}
            >
              <td
                colSpan={columns.length}
                style={{
                  minHeight: 120,
                  height: 120,
                  textAlign: 'center',
                  verticalAlign: 'middle',
                  color: 'var(--color-text-muted)',
                  fontSize: 'var(--font-size-md)',
                  userSelect: 'none',
                  borderBottom: '1px solid var(--color-border)',
                }}
              >
                No requirements yet — double-click here or use Add Req to get started
              </td>
            </tr>
          )}
          {visibleReqIds.map((id) => {
            const req = requirements[id];
            if (!req) return null;
            const isFocusedRow = focus?.id === id;
            const isChildOfFocused = focus?.children.includes(id) ?? false;
            return (
              <tr
                key={id}
                ref={(el) => {
                  if (el) rowRefs.current.set(id, el);
                  else rowRefs.current.delete(id);
                }}
                style={{
                  scrollMarginTop: '20px',
                  background: isFocusedRow
                    ? 'var(--color-bg-selected)'
                    : isChildOfFocused
                      ? 'var(--color-bg-hover)'
                      : undefined,
                }}
              >
                {columns.map((col) => {
                  const isFocusedCell = focus?.id === id && focus?.field === col.field;
                  return (
                    <td
                      key={col.field}
                      style={{
                        padding: '2px 8px',
                        borderBottom: '1px solid var(--color-border)',
                        outline: isFocusedCell ? '2px solid var(--color-border-focus)' : undefined,
                        outlineOffset: '-2px',
                        overflow: 'hidden',
                        cursor: 'default',
                        verticalAlign: 'top',
                      }}
                      onClick={() => handleCellClick(id, col.field)}
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
              colSpan={columns.length}
              style={{
                padding: '8px',
                color: 'var(--color-text-muted)',
                fontSize: 12,
                userSelect: 'none',
                borderTop: '1px solid var(--color-border)',
              }}
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
    </div>
  );
}
