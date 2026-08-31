import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  appCloseCommandPalette,
  appOpenCommandPalette,
  appOpenAttributes,
  appSetContentMode,
  appSetFocus,
  appSetTheme,
  appToggleEditMode,
  appToggleSidebar,
  selectAppClipboard,
  selectAppCommandPaletteOpen,
  selectAppFocusReqId,
  selectAppSelection,
  selectAppTheme,
} from '../../store/appSlice';
import { fileCreateChildReq, fileCreateNextReq, fileDeleteReq, fileRedo, fileUndo } from '../../store/fileSlice';
import { searchSetVisible } from '../../store/searchSlice';
import { selectFileReqList, selectFileRequirements } from '../../store/fileSliceMemoSelector';
import { RootState } from '../../store/store';
import { api } from '../../api/api';
import { filterCommands } from './filterCommands';
import type { Command } from './filterCommands';
import { buildNavCommands } from './buildNavCommands';

export function CommandPalette() {
  const dispatch = useDispatch();
  const open = useSelector(selectAppCommandPaletteOpen);
  const theme = useSelector(selectAppTheme);
  const focusId = useSelector(selectAppFocusReqId);
  const selection = useSelector(selectAppSelection);
  const clipboard = useSelector(selectAppClipboard);
  const reqIds = useSelector(selectFileReqList);
  const requirements = useSelector(selectFileRequirements);
  const rootId = useSelector((state: RootState) => state.file.present.root);

  const [query, setQuery] = useState('');
  const [highlightIdx, setHighlightIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const close = useCallback(() => dispatch(appCloseCommandPalette()), [dispatch]);

  useEffect(() => {
    if (open) {
      setQuery('');
      setHighlightIdx(0);
      inputRef.current?.focus();
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open, close]);

  const commands = useMemo<Command[]>(() => {
    const staticCmds: Command[] = [
      { id: 'undo', label: 'Undo', section: 'Actions', shortcut: 'Ctrl+Z', action: () => { dispatch(fileUndo()); close(); } },
      { id: 'redo', label: 'Redo', section: 'Actions', shortcut: 'Ctrl+Y', action: () => { dispatch(fileRedo()); close(); } },
      { id: 'new', label: 'New Document', section: 'Actions', action: () => { api.new(); close(); } },
      { id: 'open', label: 'Open Document', section: 'Actions', action: () => { api.open(); close(); } },
      { id: 'save', label: 'Save', section: 'Actions', action: () => { api.save(); close(); } },
      { id: 'save-as', label: 'Save As', section: 'Actions', action: () => { api.saveAs(); close(); } },
      { id: 'export-reqif', label: 'Export ReqIF', section: 'Actions', action: () => { api.exportReqIf(); close(); } },
      { id: 'import-reqif', label: 'Import ReqIF', section: 'Actions', action: () => { api.importReqIf(); close(); } },
      { id: 'edit-attrs', label: 'Edit Attributes', section: 'Actions', action: () => { dispatch(appOpenAttributes()); close(); } },
      { id: 'add-req', label: 'Add Requirement', section: 'Actions', action: () => { dispatch(fileCreateNextReq(focusId ?? undefined)); close(); } },
      { id: 'add-child', label: 'Add Child Requirement', section: 'Actions', action: () => { if (focusId !== null) { dispatch(fileCreateChildReq(focusId)); } close(); } },
      { id: 'delete-req', label: 'Delete Requirement', section: 'Actions', action: () => { if (focusId !== null) { dispatch(fileDeleteReq(focusId)); } close(); } },
      {
        id: 'copy', label: 'Copy', section: 'Actions', shortcut: 'Ctrl+C',
        action: () => { if (selection.length > 0) { api.copy(selection, false); } close(); },
      },
      {
        id: 'cut', label: 'Cut', section: 'Actions', shortcut: 'Ctrl+X',
        action: () => { if (selection.length > 0) { api.cut(selection); } close(); },
      },
      {
        id: 'paste', label: 'Paste', section: 'Actions', shortcut: 'Ctrl+V',
        action: () => { if (clipboard !== null) { api.paste(focusId ?? 0, false); } close(); },
      },
      { id: 'view-table', label: 'Table View', section: 'View', action: () => { dispatch(appSetContentMode('TABLE')); close(); } },
      { id: 'view-raw', label: 'Raw JSON View', section: 'View', action: () => { dispatch(appSetContentMode('RAW')); close(); } },
      { id: 'view-file', label: 'File View', section: 'View', action: () => { dispatch(appSetContentMode('FILE')); close(); } },
      { id: 'view-reqif', label: 'ReqIF View', section: 'View', action: () => { dispatch(appSetContentMode('REGIF')); close(); } },
      { id: 'toggle-sidebar', label: 'Toggle Sidebar', section: 'View', action: () => { dispatch(appToggleSidebar()); close(); } },
      { id: 'toggle-edit', label: 'Toggle Edit Mode', section: 'View', action: () => { dispatch(appToggleEditMode()); close(); } },
      {
        id: 'toggle-theme', label: 'Toggle Theme', section: 'View',
        action: () => { dispatch(appSetTheme(theme === 'dark' ? 'light' : 'dark')); close(); },
      },
      { id: 'search', label: 'Open Search', section: 'Find', shortcut: 'Ctrl+F', action: () => { dispatch(searchSetVisible(true)); close(); } },
    ];

    const navCmds: Command[] = buildNavCommands(reqIds, requirements, rootId, (id) => {
      dispatch(appSetFocus({ id, field: 'content', editable: false }));
      close();
    });

    return [...staticCmds, ...navCmds];
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, focusId, selection, clipboard, reqIds, requirements, rootId, theme]);

  const filtered = useMemo(() => filterCommands(commands, query), [commands, query]);

  useEffect(() => {
    setHighlightIdx(0);
  }, [query]);

  const execute = (cmd: Command) => {
    cmd.action();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIdx((i) => (i + 1) % Math.max(filtered.length, 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIdx((i) => (i - 1 + Math.max(filtered.length, 1)) % Math.max(filtered.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[highlightIdx]) execute(filtered[highlightIdx]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  const sections = Array.from(new Set(filtered.map((c) => c.section)));
  const showResults = query.length > 0;

  return (
    <div
      ref={panelRef}
      className="cmd-panel"
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      onKeyDown={handleKeyDown}
    >
      <div className="cmd-input-row">
        <input
          ref={inputRef}
          className="cmd-input"
          type="text"
          placeholder="Type a command or search…"
          aria-label="Filter commands"
          value={query}
          onFocus={() => dispatch(appOpenCommandPalette())}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>
      {showResults && (
        <div className="cmd-results" role="listbox">
          {sections.map((section) => (
            <div key={section}>
              <div className="cmd-section-header">{section}</div>
              {filtered
                .filter((c) => c.section === section)
                .map((cmd) => {
                  const globalIdx = filtered.indexOf(cmd);
                  const isActive = globalIdx === highlightIdx;
                  return (
                    <div
                      key={cmd.id}
                      className={`cmd-result-row${isActive ? ' is-active' : ''}`}
                      role="option"
                      aria-selected={isActive}
                      onClick={() => execute(cmd)}
                      onMouseEnter={() => setHighlightIdx(globalIdx)}
                    >
                      <span className="cmd-result-label">{cmd.label}</span>
                      {cmd.shortcut && (
                        <span className="cmd-result-shortcut">{cmd.shortcut}</span>
                      )}
                    </div>
                  );
                })}
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="cmd-no-results">No results</div>
          )}
        </div>
      )}
    </div>
  );
}
