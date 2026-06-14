import { useRef } from 'react';
import type { ViewColumn } from '../../store/file';

export function useColumnResize(
  columns: ViewColumn[],
  onResizeEnd: (columns: ViewColumn[]) => void,
) {
  const dragRef = useRef<{
    colIndex: number;
    startX: number;
    startWidth: number;
    workingColumns: ViewColumn[];
  } | null>(null);

  const handleResizeStart = (e: React.MouseEvent, colIndex: number) => {
    e.preventDefault();
    dragRef.current = {
      colIndex,
      startX: e.clientX,
      startWidth: columns[colIndex].width ?? 100,
      workingColumns: columns.map((c) => ({ ...c })),
    };

    const onMouseMove = (ev: MouseEvent) => {
      if (!dragRef.current) return;
      const { colIndex: ci, startX, startWidth } = dragRef.current;
      const newWidth = Math.max(40, startWidth + (ev.clientX - startX));
      dragRef.current.workingColumns = dragRef.current.workingColumns.map((col, i) =>
        i === ci ? { ...col, width: newWidth } : col,
      );
    };

    const onMouseUp = () => {
      if (dragRef.current) {
        onResizeEnd(dragRef.current.workingColumns);
        dragRef.current = null;
      }
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return { handleResizeStart };
}
