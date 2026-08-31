import { useEffect } from 'react';
import { fileUndo, fileRedo } from '../store/fileSlice';
import {
  appOpenCommandPalette,
  selectAppSelection,
  selectAppClipboard,
  selectAppFocusReqId,
} from '../store/appSlice';
import { searchSetVisible } from '../store/searchSlice';
import type { RootState } from '../store/store';
import type { BaseApi } from '../api/BaseApi';

interface MinimalStore {
  dispatch: (action: unknown) => unknown;
  getState: () => RootState;
}

export function isInputFocused(target: EventTarget | null): boolean {
  if (!(target instanceof Element)) return false;
  const tag = target.tagName;
  if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
  if (target.closest('.lexical-editor')) return true;
  return false;
}

export function createKeyHandler(
  store: MinimalStore,
  api: Pick<BaseApi, 'copy' | 'cut' | 'paste'>,
): (event: KeyboardEvent) => void {
  return function handleKeyDown(event: KeyboardEvent): void {
    if (isInputFocused(event.target)) return;

    const mod = event.ctrlKey || event.metaKey;
    if (!mod) return;

    const key = event.key.toLowerCase();

    if (key === 'k') {
      event.preventDefault();
      store.dispatch(appOpenCommandPalette());
    } else if (key === 'z') {
      event.preventDefault();
      store.dispatch(fileUndo());
    } else if (key === 'y') {
      event.preventDefault();
      store.dispatch(fileRedo());
    } else if (key === 'f') {
      event.preventDefault();
      store.dispatch(searchSetVisible(true));
    } else if (key === 'c') {
      const selection = selectAppSelection(store.getState());
      if (selection.length > 0) {
        api.copy(selection, false);
      }
    } else if (key === 'x') {
      const selection = selectAppSelection(store.getState());
      if (selection.length > 0) {
        api.cut(selection);
      }
    } else if (key === 'v') {
      const clipboard = selectAppClipboard(store.getState());
      if (clipboard !== null) {
        const focusedReqId = selectAppFocusReqId(store.getState());
        event.preventDefault();
        api.paste(focusedReqId ?? 0, false);
      }
    }
  };
}

export function useGlobalHotkeys(
  store: MinimalStore,
  api: Pick<BaseApi, 'copy' | 'cut' | 'paste'>,
): void {
  useEffect(() => {
    const handler = createKeyHandler(store, api);
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [store, api]);
}
