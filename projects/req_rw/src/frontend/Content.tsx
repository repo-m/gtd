import { useCallback, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from './store/store';
import { selectAppSidebar, appClearError, appSetError } from './store/appSlice';
import './styles/themes.css';
import './styles.css';
import { MenuBar } from './components/MenuBar';
import { SideBar } from './components/SideBar';
import { StatusBar } from './components/StatusBar';
import { AttributesView } from './views/AttributesView/AttributesView';
import { View } from './View';
import { GlobalEditorProvider } from './components/GlobalEditorContext';
import { DocumentIcon } from './components/Icon';
import { api } from './api/api';

export function Content() {
  const dispatch = useDispatch<AppDispatch>();
  const attributesOpen = useSelector((state: RootState) => state.app.attributesOpen);
  const sidebarVisible = useSelector(selectAppSidebar);
  const searchVisible = useSelector((state: RootState) => state.search.isVisible);
  const filename = useSelector((state: RootState) => state.app.filename);
  const [sidebarWidth, setSidebarWidth] = useState(200);

  const handleResizeMouseDown = useCallback(
    (e: React.MouseEvent) => {
      const startX = e.clientX;
      const startWidth = sidebarWidth;

      const onMouseMove = (ev: MouseEvent) => {
        const next = startWidth + (ev.clientX - startX);
        setSidebarWidth(Math.max(50, Math.min(next, window.innerWidth / 2)));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    },
    [sidebarWidth],
  );

  return (
    <GlobalEditorProvider>
      <div className={searchVisible ? 'search-visible' : ''}>
        <MenuBar />
        <div style={{ display: 'flex' }}>
          {filename !== null && sidebarVisible && (
            <>
              <div style={{ width: sidebarWidth, minWidth: sidebarWidth, overflow: 'hidden' }}>
                <SideBar />
              </div>
              <div
                className="resize-handle"
                style={{ width: 1, cursor: 'col-resize', background: 'var(--color-border)', flexShrink: 0 }}
                onMouseDown={handleResizeMouseDown}
              />
            </>
          )}
          {filename === null ? (
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--color-text-muted)',
              }}
            >
              <DocumentIcon size={48} aria-hidden="true" />
              <p
                style={{
                  marginTop: 'var(--space-5)',
                  marginBottom: 0,
                  fontSize: 'var(--font-size-lg)',
                  fontWeight: 'var(--font-weight-normal)',
                  color: 'var(--color-text-muted)',
                }}
              >
                No file open
              </p>
              <div style={{ display: 'flex', gap: 'var(--space-3)', marginTop: 'var(--space-4)' }}>
                <button
                  className="menu-btn"
                  onClick={async () => {
                    const r = await api.open();
                    dispatch(r.ok ? appClearError() : appSetError(r.error!));
                  }}
                >
                  Open file
                </button>
                <button
                  className="menu-btn"
                  onClick={() => {
                    const r = api.new();
                    dispatch(r.ok ? appClearError() : appSetError(r.error!));
                  }}
                >
                  New file
                </button>
              </div>
            </div>
          ) : (
            <View />
          )}
        </div>
        <StatusBar />
        {attributesOpen && <AttributesView />}
      </div>
    </GlobalEditorProvider>
  );
}
