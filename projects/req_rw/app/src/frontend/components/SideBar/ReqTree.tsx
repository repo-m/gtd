import { useSelector } from 'react-redux';
import { selectFileRoot } from '../../store/fileSliceMemoSelector';
import { ReqTreeItem } from './ReqTreeItem';

export function ReqTree() {
  const root = useSelector(selectFileRoot);

  if (!root) return <div />;

  if (root.children.length === 0) {
    return (
      <div
        style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--color-text-muted)',
          fontSize: 'var(--font-size-sm)',
        }}
      >
        No requirements
      </div>
    );
  }

  return (
    <div style={{ overflow: 'auto', height: '100%' }}>
      {root.children.map((childId) => (
        <ReqTreeItem key={childId} id={childId} depth={0} />
      ))}
    </div>
  );
}
