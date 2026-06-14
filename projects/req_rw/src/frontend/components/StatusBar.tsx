import { useDispatch, useSelector } from 'react-redux';
import { appSetEditMode, appToggleSidebar, selectAppSidebar } from '../store/appSlice';
import { searchMoveIndex } from '../store/searchSlice';
import type { RootState } from '../store/store';
import { ChevronLeftIcon, ChevronRightIcon } from './Icon';

export function StatusBar() {
  const dispatch = useDispatch();
  const filename = useSelector((state: RootState) => state.app.filename);
  const editMode = useSelector((state: RootState) => state.app.editMode);
  const lastError = useSelector((state: RootState) => state.app.lastError);
  const count = useSelector((state: RootState) => state.search.count);
  const sidebar = useSelector(selectAppSidebar);

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
        {filename ?? 'Untitled'}
      </span>
      <button
        className={editMode ? 'status-btn is-active' : 'status-btn'}
        onClick={() => dispatch(appSetEditMode(!editMode))}
        title="Toggle edit mode"
      >
        {editMode ? 'Editing' : 'Viewing'}
      </button>
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
