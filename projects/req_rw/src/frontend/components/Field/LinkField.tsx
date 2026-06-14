import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectFileLinkset, type LinkEntry } from '../../store/fileSliceMemoSelector';
import { LinkOutIcon, LinkInIcon } from '../Icon';

interface Props {
  id: number;
}

export function LinkField({ id }: Props) {
  const linkset = useSelector(selectFileLinkset);
  const entry = linkset[id] ?? { out: [], in: [] };
  const [menu, setMenu] = useState<{ items: LinkEntry[]; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!menu) return;
    const close = () => setMenu(null);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenu(null);
    };
    document.addEventListener('click', close);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('click', close);
      document.removeEventListener('keydown', onKey);
    };
  }, [menu]);

  const openMenu = (e: React.MouseEvent, items: LinkEntry[]) => {
    e.stopPropagation();
    if (items.length === 0) return;
    setMenu({ items, x: e.clientX, y: e.clientY });
  };

  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <span
        onClick={(e) => openMenu(e, entry.out)}
        onContextMenu={(e) => openMenu(e, entry.out)}
        className={`link-icon link-icon--out${entry.out.length > 0 ? ' link-icon--clickable' : ' link-icon--hidden'}`}
      >
        <LinkOutIcon aria-hidden={true} />
      </span>
      <span
        onClick={(e) => openMenu(e, entry.in)}
        onContextMenu={(e) => openMenu(e, entry.in)}
        className={`link-icon link-icon--in${entry.in.length > 0 ? ' link-icon--clickable' : ' link-icon--hidden'}`}
      >
        <LinkInIcon aria-hidden={true} />
      </span>
      {menu && (
        <ul
          style={{
            position: 'fixed',
            left: menu.x,
            top: menu.y,
            margin: 0,
            padding: 'var(--space-1) 0',
            listStyle: 'none',
            background: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-md)',
            boxShadow: 'var(--shadow-popover)',
            zIndex: 9999,
            minWidth: 160,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {menu.items.map((item, i) => (
            <li
              key={i}
              onClick={() => {
                if (item.href) window.open(item.href, '_blank');
                setMenu(null);
              }}
              style={{
                padding: 'var(--space-1) var(--space-4)',
                cursor: item.href ? 'pointer' : 'default',
                fontSize: 'var(--font-size-md)',
                whiteSpace: 'nowrap',
              }}
            >
              {item.label}
            </li>
          ))}
        </ul>
      )}
    </span>
  );
}
