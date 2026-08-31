import { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appSetEditMode, appToggleSidebar, selectAppSidebar, selectAppIsDirty, selectAppViewMismatches, selectAppIsFiltering, appOpenViewEditor, appClearAllFilters } from '../store/appSlice';
import { searchMoveIndex } from '../store/searchSlice';
import { selectFilteredDisplayCount, selectTotalDisplayCount } from '../store/fileSliceMemoSelector';
import type { RootState } from '../store/store';
import { ChevronLeftIcon, ChevronRightIcon } from './Icon';

export function StatusBar() {
  const dispatch = useDispatch();
  const filename = useSelector((state: RootState) => state.app.filename);
  const editMode = useSelector((state: RootState) => state.app.editMode);
  const lastError = useSelector((state: RootState) => state.app.lastError);
  const count = useSelector((state: RootState) => state.search.count);
  const sidebar = useSelector(selectAppSidebar);
  const isDirty = useSelector(selectAppIsDirty);
  const { missingFromFile } = useSelector(selectAppViewMismatches);
  const isFiltering = useSelector(selectAppIsFiltering);
  const filteredCount = useSelector(selectFilteredDisplayCount);
  const totalCount = useSelector(selectTotalDisplayCount);

  const [popoverOpen, setPopoverOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!popoverOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setPopoverOpen(false);
    };
    const handleClick = (e: MouseEvent) => {
      if (
        popoverRef.current && !popoverRef.current.contains(e.target as Node) &&
        btnRef.current && !btnRef.current.contains(e.target as Node)
      ) {
        setPopoverOpen(false);
      }
    };
    document.addEventListener('keydown', handleKey);
    document.addEventListener('mousedown', handleClick);
    return () => {
      document.removeEventListener('keydown', handleKey);
      document.removeEventListener('mousedown', handleClick);
    };
  }, [popoverOpen]);

  return (
    <div className="status-bar">
      <button
        className="status-btn"
        onClick={() => dispatch(appToggleSidebar())}
        title="Toggle sidebar"
        aria-label="Toggle sidebar"
      >
        {sidebar ? <ChevronLeftIcon aria-hidden={true} /> : <ChevronRightIcon aria-hidden={true} />}
      </button>
      <span className="status-bar__filename">
        {(filename ?? 'Untitled') + (isDirty ? '·' : '')}
      </span>
      <button
        className={editMode ? 'status-btn is-active' : 'status-btn'}
        onClick={() => dispatch(appSetEditMode(!editMode))}
        title="Toggle edit mode"
      >
        {editMode ? 'Editing' : 'Viewing'}
      </button>
      {isFiltering && (
        <button
          className="status-btn"
          onClick={() => dispatch(appClearAllFilters())}
          title="Clear all filters"
        >
          Showing {filteredCount} of {totalCount}
        </button>
      )}
      {missingFromFile.length > 0 && (
        <div style={{ position: 'relative' }}>
          <button
            ref={btnRef}
            className="status-btn"
            title="View references fields not in this document"
            onClick={() => setPopoverOpen((o) => !o)}
          >
            ⚠ {missingFromFile.length} fields
          </button>
          {popoverOpen && (
            <div ref={popoverRef} className="mismatch-popover">
              <div className="mismatch-popover__fields">
                {missingFromFile.map((f) => (
                  <div key={f}>{f}</div>
                ))}
              </div>
              <button
                className="menu-btn"
                onClick={() => { dispatch(appOpenViewEditor()); setPopoverOpen(false); }}
              >
                Edit View →
              </button>
            </div>
          )}
        </div>
      )}
      {filename !== null && (
        <span className="status-item">
          {isFiltering ? `${filteredCount} / ${totalCount} reqs` : `${totalCount} reqs`}
        </span>
      )}
      <button
        className="status-btn"
        onClick={() => dispatch(searchMoveIndex(false))}
        disabled={count === 0}
        title="Previous result"
        aria-label="Previous result"
      >
        <ChevronLeftIcon aria-hidden={true} />
      </button>
      <button
        className="status-btn"
        onClick={() => dispatch(searchMoveIndex(true))}
        disabled={count === 0}
        title="Next result"
        aria-label="Next result"
      >
        <ChevronRightIcon aria-hidden={true} />
      </button>
      {lastError && (
        <span className="status-bar__error">
          {lastError}
        </span>
      )}
    </div>
  );
}
