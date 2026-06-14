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
      style={{
        position: 'fixed',
        top: y,
        left: x,
        background: 'var(--color-bg)',
        border: '1px solid var(--color-border)',
        borderRadius: 4,
        boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
        zIndex: 9999,
        minWidth: 160,
        padding: '4px 0',
      }}
    >
      {items.map((item, i) =>
        'separator' in item ? (
          <hr
            key={i}
            style={{ margin: '4px 0', border: 'none', borderTop: '1px solid var(--color-border)' }}
          />
        ) : (
          <div
            key={i}
            onMouseDown={() => {
              if (!item.disabled) {
                item.onClick();
                onClose();
              }
            }}
            style={{
              padding: '6px 12px',
              cursor: item.disabled ? 'default' : 'pointer',
              color: item.disabled ? 'var(--color-text-muted)' : 'var(--color-text)',
              fontSize: 13,
              userSelect: 'none',
            }}
            onMouseEnter={(e) => {
              if (!item.disabled) (e.currentTarget as HTMLElement).style.background = 'var(--color-bg-hover)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            {item.label}
          </div>
        ),
      )}
    </div>
  );
}
