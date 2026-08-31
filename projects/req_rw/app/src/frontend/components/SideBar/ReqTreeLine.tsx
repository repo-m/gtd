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
        className="req-tree-chevron"
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
        <span className="req-tree-num-label">{numStr}</span>
      )}
      <span className="req-tree-label-text">
        {labelText}
      </span>
    </div>
  );
}
