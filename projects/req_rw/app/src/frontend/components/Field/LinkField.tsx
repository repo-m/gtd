import { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectFileLinkset, type LinkEntry } from '../../store/fileSliceMemoSelector';
import { LinkOutIcon, LinkInIcon } from '../Icon';
import { ContextMenu, type ContextMenuItem } from '../ContextMenu';

interface Props {
  id: number;
}

function toMenuItems(entries: LinkEntry[]): ContextMenuItem[] {
  return entries.map((item) => ({
    label: item.label,
    onClick: () => {
      if (item.href) window.open(item.href, '_blank');
    },
  }));
}

export function LinkField({ id }: Props) {
  const linkset = useSelector(selectFileLinkset);
  const entry = linkset[id] ?? { out: [], in: [] };
  const [menu, setMenu] = useState<{ items: LinkEntry[]; x: number; y: number } | null>(null);

  const openMenu = (e: React.MouseEvent, items: LinkEntry[]) => {
    e.stopPropagation();
    if (items.length === 0) return;
    setMenu({ items, x: e.clientX, y: e.clientY });
  };

  return (
    <span className="link-field">
      <span
        onClick={(e) => openMenu(e, entry.out)}
        onContextMenu={(e) => openMenu(e, entry.out)}
        className={`link-icon link-icon--out${entry.out.length > 0 ? ' link-icon--clickable' : ' link-icon--hidden'}`}
        {...(entry.out.length > 0 ? { title: `Outward links (${entry.out.length})`, 'aria-label': `Outward links (${entry.out.length})` } : {})}
      >
        <LinkOutIcon aria-hidden={true} />
      </span>
      <span
        onClick={(e) => openMenu(e, entry.in)}
        onContextMenu={(e) => openMenu(e, entry.in)}
        className={`link-icon link-icon--in${entry.in.length > 0 ? ' link-icon--clickable' : ' link-icon--hidden'}`}
        {...(entry.in.length > 0 ? { title: `Inward links (${entry.in.length})`, 'aria-label': `Inward links (${entry.in.length})` } : {})}
      >
        <LinkInIcon aria-hidden={true} />
      </span>
      {menu && (
        <ContextMenu
          x={menu.x}
          y={menu.y}
          items={toMenuItems(menu.items)}
          onClose={() => setMenu(null)}
        />
      )}
    </span>
  );
}
