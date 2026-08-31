import { SectionType } from './AttributesSidebar';

export interface MenuActions {
  onAdd: () => void;
  onRemove: () => void;
}

interface AttributesMenuProps {
  section: SectionType;
  actions: MenuActions;
}

export function AttributesMenu({ section, actions }: AttributesMenuProps) {
  if (section === 'general') return <div style={{ height: 36 }} />;

  const addLabel = section === 'fields' ? 'Add Field' : 'Add View';
  const removeLabel = section === 'fields' ? 'Remove Field' : 'Remove View';

  return (
    <div
      style={{
        display: 'flex',
        gap: 8,
        padding: '6px 12px',
        borderBottom: '1px solid var(--color-border)',
        background: 'var(--color-bg-subtle)',
      }}
    >
      <button onClick={actions.onAdd} className="btn">
        {addLabel}
      </button>
      <button onClick={actions.onRemove} className="btn">
        {removeLabel}
      </button>
    </div>
  );
}
