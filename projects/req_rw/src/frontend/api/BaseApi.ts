import { store } from '../store/store';
import { appSetError, appUpdateClipboard, ClipboardState } from '../store/appSlice';
import { fileDeleteReq, fileImportNextReq, fileImportChildReq, fileUpdateReq } from '../store/fileSlice';
import { storeToSubFile, jsonToYaml, yamlToJson, fileToState, FileState } from '../store/file';
import { APP_IDENTIFIER, APP_MIMETYPE_TEXT_REQ, APP_VERSION } from '../constants/app_constants';
import { clipboardRead, clipboardWrite } from './clipboard';

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

  async exportReqIf(): Promise<ApiResult> {
    return { ok: true };
  }

  async importReqIf(): Promise<ApiResult> {
    return { ok: true };
  }

  abstract new(): ApiResult;
  abstract open(): Promise<ApiResult>;

  async copy(id: number, subtree: boolean): Promise<ApiResult> {
    const fileState = store.getState().file.present;
    const subFile = subtree ? storeToSubFile(fileState, id) : this._singleNodeSubFile(fileState, id);
    const text = this._subFileToClipboardText(subFile, 'copy');
    this.dispatch(appUpdateClipboard({ reqId: id, operation: 'copy', mimeType: APP_MIMETYPE_TEXT_REQ }));
    try {
      await clipboardWrite(text);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Clipboard write failed: ${err}` };
    }
  }

  async cut(id: number): Promise<ApiResult> {
    const fileState = store.getState().file.present;
    const subFile = storeToSubFile(fileState, id);
    const text = this._subFileToClipboardText(subFile, 'cut');
    this.dispatch(appUpdateClipboard({ reqId: id, operation: 'cut', mimeType: APP_MIMETYPE_TEXT_REQ }));
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
    const { reqId, operation } = clipboard;
    const fileState = store.getState().file.present;
    const subFile = storeToSubFile(fileState, reqId);
    const importState = this._wrapWithSentinel(subFile, reqId);
    const importFn = asChild ? fileImportChildReq : fileImportNextReq;

    if (operation === 'cut') {
      this.dispatch(fileDeleteReq(reqId));
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
      return { reqId: rootId, operation, mimeType: APP_MIMETYPE_TEXT_REQ };
    } catch {
      return null;
    }
  }

  private _singleNodeSubFile(fileState: FileState, id: number): FileState {
    const req = fileState.requirements[id];
    return {
      identifier: fileState.identifier,
      title: fileState.title,
      prefix: fileState.prefix,
      description: fileState.description,
      max: fileState.max,
      next: fileState.next,
      root: id,
      requirements: req ? { [id]: { ...req, children: [] } } : {},
      views: {},
      fields: fileState.fields,
      types: [],
    };
  }
}
