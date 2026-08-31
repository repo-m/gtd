import { store } from '../store/store';
import { appSetError, appUpdateClipboard, ClipboardState } from '../store/appSlice';
import { fileDeleteReq, fileImportNextReq, fileImportChildReq, fileUpdateReq } from '../store/fileSlice';
import { storeToSubFile, jsonToYaml, yamlToJson, fileToState, FileState, Req } from '../store/file';
import type { ViewColumn } from '../store/file';
import { APP_IDENTIFIER, APP_VERSION } from '../constants/app_constants';
import { clipboardRead, clipboardWrite } from './clipboard';

export interface FileViewState {
  active_view: string;
  views: Record<string, ViewColumn[]>;
}

export interface Prefs {
  last_filepath?: string;
  file_state?: Record<string, FileViewState>;
}

export interface ApiResult<T = void> {
  ok: boolean;
  data?: T;
  error?: string;
}

export abstract class BaseApi {
  protected readonly dispatch = store.dispatch;

  async init(): Promise<ApiResult> {
    return { ok: true };
  }

  async save(filepath?: string): Promise<ApiResult> {
    return { ok: true };
  }

  async saveAs(): Promise<ApiResult> {
    return this.save();
  }

  async getPrefs(): Promise<ApiResult<Prefs>> {
    return { ok: true, data: {} };
  }

  async saveFileState(_key: string, _state: FileViewState): Promise<ApiResult> {
    return { ok: true };
  }

  async exportReqIf(): Promise<ApiResult> {
    return { ok: true };
  }

  async importReqIf(): Promise<ApiResult> {
    return { ok: true };
  }

  abstract new(): ApiResult;
  abstract open(): Promise<ApiResult>;

  async copy(id: number | number[], subtree: boolean): Promise<ApiResult> {
    const ids = Array.isArray(id) ? id : [id];
    const fileState = store.getState().file.present;
    const subFile = subtree ? storeToSubFile(fileState, id) : this._singleNodeSubFile(fileState, id);
    const text = this._subFileToClipboardText(subFile, 'copy');
    this.dispatch(appUpdateClipboard({ reqIds: ids, operation: 'copy' }));
    try {
      await clipboardWrite(text);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Clipboard write failed: ${err}` };
    }
  }

  async cut(id: number | number[]): Promise<ApiResult> {
    const ids = Array.isArray(id) ? id : [id];
    const fileState = store.getState().file.present;
    const subFile = storeToSubFile(fileState, id);
    const text = this._subFileToClipboardText(subFile, 'cut');
    this.dispatch(appUpdateClipboard({ reqIds: ids, operation: 'cut' }));
    try {
      await clipboardWrite(text);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Clipboard write failed: ${err}` };
    }
  }

  async paste(targetId: number, asChild: boolean): Promise<ApiResult> {
    const clipboard = store.getState().app.clipboard;
    if (clipboard) {
      this._pasteFromInternal(clipboard, targetId, asChild);
      return { ok: true };
    }
    try {
      const text = await clipboardRead();
      return this._pasteFromOsClipboard(text, targetId, asChild);
    } catch (err) {
      return { ok: false, error: `Clipboard read failed: ${err}` };
    }
  }

  checkClipboard(): void {
    clipboardRead()
      .then((text) => {
        const parsed = this._parseClipboardHeader(text);
        if (parsed) {
          this.dispatch(appUpdateClipboard(parsed));
        } else if (store.getState().app.clipboard !== null) {
          this.dispatch(appUpdateClipboard(null));
        }
      })
      .catch(() => {
        // Permission denied — leave clipboard state unchanged
      });
  }

  private _pasteFromInternal(
    clipboard: ClipboardState,
    targetId: number,
    asChild: boolean,
  ): void {
    const { reqIds, operation } = clipboard;
    const fileState = store.getState().file.present;
    const subFile = storeToSubFile(fileState, reqIds);
    // Safe even though `subFile` is already sentinel-wrapped when `reqIds` has
    // more than one entry: `_wrapWithSentinel`'s freshly-built sentinel entry
    // is spread first and `subFile.requirements` (which already carries the
    // real sentinel at the same id) is spread after, so the real one wins.
    const importState = this._wrapWithSentinel(subFile, subFile.root!);
    const importFn = asChild ? fileImportChildReq : fileImportNextReq;

    if (operation === 'cut') {
      for (const reqId of reqIds) {
        this.dispatch(fileDeleteReq(reqId));
      }
      this.dispatch(importFn({ importState, targetId, merge: true }));
    } else {
      this.dispatch(importFn({ importState, targetId, merge: false }));
    }
  }

  private _pasteFromOsClipboard(text: string, targetId: number, asChild: boolean): ApiResult {
    const headerMatch = text.match(
      /^#user-agent: Req\.rw\/[\S]+ \(([^)]+)\) \[(copy|cut)\]\n/,
    );
    if (!headerMatch) {
      this.dispatch(fileUpdateReq({ id: targetId, field: 'text', value: text }));
      return { ok: true };
    }
    if (headerMatch[1] !== APP_IDENTIFIER) {
      this.dispatch(appSetError('Cannot paste content from a different Req.rw document.'));
      return { ok: false, error: 'Cross-instance paste blocked' };
    }
    const yamlText = text.slice(headerMatch[0].length);
    try {
      const importedState = fileToState(yamlText);
      if (importedState.root === null) return { ok: false, error: 'Clipboard document has no root' };
      const importState = this._wrapWithSentinel(importedState, importedState.root);
      const importFn = asChild ? fileImportChildReq : fileImportNextReq;
      this.dispatch(importFn({ importState, targetId, merge: false }));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Failed to parse clipboard content: ${err}` };
    }
  }

  private _wrapWithSentinel(subFile: FileState, rootId: number): FileState {
    const sentinelId = -1;
    return {
      ...subFile,
      root: sentinelId,
      requirements: {
        [sentinelId]: { id: sentinelId, children: [rootId] },
        ...subFile.requirements,
      },
    };
  }

  private _subFileToClipboardText(subFile: FileState, operation: 'copy' | 'cut'): string {
    const header = `#user-agent: Req.rw/${APP_VERSION} (${APP_IDENTIFIER}) [${operation}]`;
    const body = jsonToYaml({
      root: subFile.root,
      requirements: Object.values(subFile.requirements).sort(
        (a, b) => (a.id as number) - (b.id as number),
      ),
    });
    return `${header}\n${body}`;
  }

  private _parseClipboardHeader(text: string): ClipboardState | null {
    const match = text.match(/^#user-agent: Req\.rw\/[\S]+ \(([^)]+)\) \[(copy|cut)\]\n/);
    if (!match) return null;
    const operation = match[2] as 'copy' | 'cut';
    try {
      const yamlText = text.slice(match[0].length);
      const raw = yamlToJson(yamlText);
      const rootId = raw.root as number;
      if (typeof rootId !== 'number') return null;
      return { reqIds: [rootId], operation };
    } catch {
      return null;
    }
  }

  private _singleNodeSubFile(fileState: FileState, id: number | number[]): FileState {
    const ids = Array.isArray(id) ? Array.from(new Set(id)) : [id];
    const requirements: { [id: number]: Req } = {};
    for (const rid of ids) {
      const req = fileState.requirements[rid];
      if (req) requirements[rid] = { ...req, children: [] };
    }
    const base = {
      identifier: fileState.identifier,
      title: fileState.title,
      prefix: fileState.prefix,
      description: fileState.description,
      max: fileState.max,
      next: fileState.next,
      fields: fileState.fields,
      types: [] as unknown[],
    };

    if (ids.length === 1) {
      return { ...base, root: ids[0], requirements };
    }

    const sentinelId = -1;
    requirements[sentinelId] = { id: sentinelId, children: ids };
    return { ...base, root: sentinelId, requirements };
  }
}
