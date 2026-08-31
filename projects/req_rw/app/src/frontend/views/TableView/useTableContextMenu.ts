import { useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { appToggleFocus, appSetFocus, selectAppClipboard, selectAppSelection } from '../../store/appSlice';
import { fileCreateNextReq, fileCreateChildReq, fileDeleteReq } from '../../store/fileSlice';
import { api } from '../../api/api';
import type { ContextMenuItem } from '../../components/ContextMenu';

interface MenuState {
  x: number;
  y: number;
  reqId: number;
  field: string;
  index: number;
}

export function useTableContextMenu(
  visibleReqIds: number[],
  getDescendants: (id: number) => number[],
) {
  const dispatch = useDispatch<AppDispatch>();
  const clipboard = useSelector(selectAppClipboard);
  const selection = useSelector(selectAppSelection);
  const [menu, setMenu] = useState<MenuState | null>(null);

  const close = useCallback(() => setMenu(null), []);

  const handleContextMenu = useCallback(
    (id: number, field: string, e: React.MouseEvent) => {
      e.preventDefault();
      setMenu({ x: e.clientX, y: e.clientY, reqId: id, field, index: visibleReqIds.indexOf(id) });
    },
    [visibleReqIds],
  );

  const items: ContextMenuItem[] = menu
    ? selection.length > 1
      ? [
          // Bulk group
          {
            label: `Copy selected (${selection.length})`,
            onClick: () => {
              api.copy(selection, false);
              close();
            },
          },
          {
            label: `Cut selected (${selection.length})`,
            onClick: () => {
              api.cut(selection);
              close();
            },
          },
          {
            label: `Delete selected (${selection.length})`,
            onClick: () => {
              const idsInOrder = visibleReqIds.filter((id) => selection.includes(id));
              for (const id of [...idsInOrder].reverse()) {
                dispatch(fileDeleteReq(id));
              }
              close();
            },
          },
        ]
      : [
          // Group 1: Select / Edit field
          {
            label: 'Select',
            onClick: () => {
              const children = getDescendants(menu.reqId);
              dispatch(appToggleFocus({ id: menu.reqId, field: menu.field, index: menu.index, children }));
            },
          },
          {
            label: 'Edit field',
            onClick: () => {
              const children = getDescendants(menu.reqId);
              dispatch(appSetFocus({ id: menu.reqId, field: menu.field, editable: true, index: menu.index, children }));
            },
          },
          { separator: true as const },
          // Group 2: Clipboard
          { label: 'Copy', onClick: () => api.copy(menu.reqId, false) },
          { label: 'Copy with children', onClick: () => api.copy(menu.reqId, true) },
          { label: 'Cut', onClick: () => api.cut(menu.reqId) },
          {
            label: 'Paste as sibling',
            onClick: () => api.paste(menu.reqId, false),
            disabled: clipboard == null,
          },
          {
            label: 'Paste as child',
            onClick: () => api.paste(menu.reqId, true),
            disabled: clipboard == null,
          },
          { separator: true as const },
          // Group 3: CRUD
          { label: 'Add sibling', onClick: () => dispatch(fileCreateNextReq(menu.reqId)) },
          { label: 'Add child', onClick: () => dispatch(fileCreateChildReq(menu.reqId)) },
          { label: 'Remove', onClick: () => dispatch(fileDeleteReq(menu.reqId)) },
        ]
    : [];

  return {
    handleContextMenu,
    contextMenu: menu ? { x: menu.x, y: menu.y, items, onClose: close } : null,
  };
}
