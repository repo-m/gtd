export type SectionType = 'general' | 'fields';

const SECTIONS: { id: SectionType; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'fields', label: 'Fields' },
];

interface AttributesSidebarProps {
  selectedSection: SectionType;
  onSelect: (section: SectionType) => void;
}

export function AttributesSidebar({ selectedSection, onSelect }: AttributesSidebarProps) {
  return (
    <div
      style={{
        width: 140,
        borderRight: '1px solid var(--color-border)',
        flexShrink: 0,
        padding: '8px 0',
      }}
    >
      {SECTIONS.map(({ id, label }) => (
        <div
          key={id}
          onClick={() => onSelect(id)}
          style={{
            padding: '6px 16px',
            cursor: 'pointer',
            fontWeight: selectedSection === id ? 'bold' : 'normal',
            background: selectedSection === id ? 'var(--color-bg-selected)' : 'transparent',
            borderLeft: selectedSection === id ? '3px solid var(--color-accent)' : '3px solid transparent',
            fontSize: 13,
          }}
        >
          {label}
        </div>
      ))}
    </div>
  );
}
