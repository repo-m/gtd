import { useCallback, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Modal } from '../../components/Modal/Modal';
import { appCloseAttributes } from '../../store/appSlice';
import { RootState } from '../../store/store';
import { AttributesContent } from './AttributesContent';
import { AttributesMenu, MenuActions } from './AttributesMenu';
import { AttributesSidebar, SectionType } from './AttributesSidebar';

export function AttributesView() {
  const dispatch = useDispatch();
  const { title, prefix, description, fields } = useSelector(
    (state: RootState) => state.file.present,
  );

  const [selectedSection, setSelectedSection] = useState<SectionType>('general');
  const [menuActions, setMenuActions] = useState<MenuActions>({ onAdd: () => {}, onRemove: () => {} });

  const submitRef = useRef<() => void>(() => {});

  const stableSetOnSubmit = useCallback((fn: () => void) => {
    submitRef.current = fn;
  }, []);

  const stableSetMenuActions = useCallback((actions: MenuActions) => {
    setMenuActions(actions);
  }, []);

  function handleOK() {
    submitRef.current();
    dispatch(appCloseAttributes());
  }

  function handleCancel() {
    dispatch(appCloseAttributes());
  }

  return (
    <Modal title="Edit Attributes" onClose={handleCancel}>
      <AttributesMenu section={selectedSection} actions={menuActions} />
      <div style={{ display: 'flex', flex: 1, minHeight: 0, height: 400 }}>
        <AttributesSidebar selectedSection={selectedSection} onSelect={setSelectedSection} />
        <AttributesContent
          section={selectedSection}
          initialTitle={title}
          initialPrefix={prefix}
          initialDescription={description}
          initialFields={fields}
          stableSetOnSubmit={stableSetOnSubmit}
          stableSetMenuActions={stableSetMenuActions}
        />
      </div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 8,
          padding: '10px 12px',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        <button onClick={handleCancel} className="btn btn--lg">
          CANCEL
        </button>
        <button onClick={handleOK} className="btn btn--lg btn--primary">
          OK
        </button>
      </div>
    </Modal>
  );
}
