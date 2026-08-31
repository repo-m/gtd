import { useEffect, useRef } from 'react';

export type ContextMenuAction = { label: string; onClick: () => void; disabled?: boolean };
export type ContextMenuSeparator = { separator: true };
export type ContextMenuItem = ContextMenuAction | ContextMenuSeparator;

interface ContextMenuProps {
  x: number;
  y: number;
  items: ContextMenuItem[];
  onClose: () => void;
}

export function ContextMenu({ x, y, items, onClose }: ContextMenuProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        onClose();
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', keyHandler);
    return () => {
      document.removeEventListener('mousedown', handler);
      document.removeEventListener('keydown', keyHandler);
    };
  }, [onClose]);

  return (
    <div
      ref={ref}
      className="context-menu"
      style={{ top: y, left: x }}
    >
      {items.map((item, i) =>
        'separator' in item ? (
          <hr key={i} className="context-menu-separator" />
        ) : (
          <div
            key={i}
            className={item.disabled ? 'context-menu-item context-menu-item--disabled' : 'context-menu-item'}
            onMouseDown={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
          >
            {item.label}
          </div>
        ),
      )}
    </div>
  );
}
