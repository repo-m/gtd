import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { appSetFocus } from '../../store/appSlice';
import { ChevronDownIcon, ChevronRightIcon } from '../Icon';

interface ReqTreeItemProps {
  id: number;
  depth?: number;
}

export function ReqTreeItem({ id, depth = 0 }: ReqTreeItemProps) {
  const [expanded, setExpanded] = useState(true);
  const req = useSelector((state: RootState) => state.file.present.requirements[id]);
  const focusId = useSelector((state: RootState) => state.app.focus?.id);
  const dispatch = useDispatch();

  if (!req) return null;

  const hasChildren = req.children.length > 0;
  const numStr = (req.num as string | undefined) ?? '';
  const rawText = req.text as string | undefined;
  const labelText = req.heading ?? (rawText ? rawText.slice(0, 60) : '');
  const isFocused = focusId === id;

  return (
    <div>
      <div
        className={`req-tree-line${isFocused ? ' is-focused' : ''}`}
        style={{ paddingLeft: `${depth * 16 + 4}px` }}
        onClick={() =>
          dispatch(appSetFocus({ id, field: 'heading', editable: false, children: req.children }))
        }
      >
        <span
          style={{ width: '1em', display: 'inline-block', flexShrink: 0 }}
          onClick={
            hasChildren
              ? (e) => {
                  e.stopPropagation();
                  setExpanded((v) => !v);
                }
              : undefined
          }
        >
          {hasChildren ? (expanded ? <ChevronDownIcon aria-hidden={true} /> : <ChevronRightIcon aria-hidden={true} />) : null}
        </span>
        {numStr && (
          <span style={{ marginRight: 4, opacity: 0.6, flexShrink: 0 }}>{numStr}</span>
        )}
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {labelText}
        </span>
      </div>
      {hasChildren &&
        expanded &&
        req.children.map((childId) => (
          <ReqTreeItem key={childId} id={childId} depth={depth + 1} />
        ))}
    </div>
  );
}
