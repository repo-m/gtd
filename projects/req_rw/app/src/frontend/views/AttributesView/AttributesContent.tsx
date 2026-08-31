import { FieldDef } from '../../store/file';
import { MenuActions } from './AttributesMenu';
import { SectionType } from './AttributesSidebar';
import { ContentFields } from './ContentFields';
import { ContentGeneral } from './ContentGeneral';

interface AttributesContentProps {
  section: SectionType;
  initialTitle: string;
  initialPrefix: string;
  initialDescription: string;
  initialFields: FieldDef[];
  stableSetOnSubmit: (fn: () => void) => void;
  stableSetMenuActions: (actions: MenuActions) => void;
}

export function AttributesContent({
  section,
  initialTitle,
  initialPrefix,
  initialDescription,
  initialFields,
  stableSetOnSubmit,
  stableSetMenuActions,
}: AttributesContentProps) {
  // All sections stay mounted to preserve unsaved local state when switching sections.
  return (
    <div style={{ flex: 1, overflowY: 'auto', minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: section === 'general' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
        <ContentGeneral
          initialTitle={initialTitle}
          initialPrefix={initialPrefix}
          initialDescription={initialDescription}
          isActive={section === 'general'}
          stableSetOnSubmit={stableSetOnSubmit}
          stableSetMenuActions={stableSetMenuActions}
        />
      </div>
      <div style={{ display: section === 'fields' ? 'flex' : 'none', flexDirection: 'column', flex: 1 }}>
        <ContentFields
          initialFields={initialFields}
          isActive={section === 'fields'}
          stableSetOnSubmit={stableSetOnSubmit}
          stableSetMenuActions={stableSetMenuActions}
        />
      </div>
    </div>
  );
}
