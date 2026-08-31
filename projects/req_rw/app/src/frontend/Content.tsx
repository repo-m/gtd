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
import { ViewEditorView } from './views/ViewEditorView/ViewEditorView';
import { View } from './View';
import { GlobalEditorProvider } from './components/GlobalEditorContext';
import { DocumentIcon } from './components/Icon';
import { api } from './api/api';
import { CommandPalette } from './components/CommandPalette/CommandPalette';

export function Content() {
  const dispatch = useDispatch<AppDispatch>();
  const attributesOpen = useSelector((state: RootState) => state.app.attributesOpen);
  const viewEditorOpen = useSelector((state: RootState) => state.app.viewEditorOpen);
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
      <div className={`content-shell${searchVisible ? ' search-visible' : ''}`}>
        <MenuBar />
        <CommandPalette />
        <div className="content-middle-row">
          {filename !== null && sidebarVisible && (
            <>
              <div style={{ width: sidebarWidth, minWidth: sidebarWidth, overflow: 'hidden' }}>
                <SideBar />
              </div>
              <div
                className="sidebar-resize-handle"
                onMouseDown={handleResizeMouseDown}
              />
            </>
          )}
          {filename === null ? (
            <div className="no-file-panel">
              <DocumentIcon size={48} aria-hidden="true" />
              <p className="no-file-panel-message">
                No file open
              </p>
              <div className="no-file-panel-actions">
                <button
                  className="btn btn--lg"
                  onClick={async () => {
                    const r = await api.open();
                    dispatch(r.ok ? appClearError() : appSetError(r.error!));
                  }}
                >
                  Open file
                </button>
                <button
                  className="btn btn--lg"
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
            <div className="view-wrapper">
              <View />
            </div>
          )}
        </div>
        <StatusBar />
        {attributesOpen && <AttributesView />}
        {viewEditorOpen && <ViewEditorView />}
      </div>
    </GlobalEditorProvider>
  );
}
