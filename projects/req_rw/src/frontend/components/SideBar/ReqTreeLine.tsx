import { ChevronDownIcon, ChevronRightIcon } from '../Icon';

interface ReqTreeLineProps {
  numStr: string;
  labelText: string;
  depth: number;
  hasChildren: boolean;
  expanded: boolean;
  isFocused: boolean;
  onToggle: () => void;
  onClick: () => void;
}

export function ReqTreeLine({
  numStr,
  labelText,
  depth,
  hasChildren,
  expanded,
  isFocused,
  onToggle,
  onClick,
}: ReqTreeLineProps) {
  return (
    <div
      className={`req-tree-line${isFocused ? ' is-focused' : ''}`}
      style={{ paddingLeft: `${depth * 16 + 4}px` }}
      onClick={onClick}
    >
      <span
        style={{ width: '1em', display: 'inline-block', flexShrink: 0 }}
        onClick={
          hasChildren
            ? (e) => {
                e.stopPropagation();
                onToggle();
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
  );
}
