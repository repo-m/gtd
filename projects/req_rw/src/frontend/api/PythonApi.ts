import { BaseApi, ApiResult } from './BaseApi';
import { fileInit } from '../store/fileSlice';
import { appSetPath } from '../store/appSlice';
import { fileToState, getNewFileState, storeToYaml } from '../store/file';
import { store } from '../store/store';
import { mapToParams } from '../transform/mapping';
import { ReqIF, formatXml } from '../transform/ReqIF/ReqIF';
import { parseReqIF } from '../transform/ReqIF/parseReqIF';
import { reqIfToState } from '../transform/ReqIF/reqIfToState';

export class PythonApi extends BaseApi {
  private windowId: string | null = null;

  override async init(): Promise<ApiResult> {
    window.addEventListener('focus', () => this.checkClipboard());

    await new Promise<void>((resolve) => {
      if (window.pywebview) {
        resolve();
      } else {
        window.addEventListener('pywebviewready', () => resolve(), { once: true });
      }
    });

    const state = await window.pywebview!.api.getState();
    this.windowId = state.id;

    if (state.filepath) {
      return this._load(state.filepath);
    }
    return { ok: true };
  }

  private get baseUrl(): string {
    return `/window/${this.windowId}/api`;
  }

  private async _load(filepath: string): Promise<ApiResult> {
    const res = await fetch(`${this.baseUrl}/file?filepath=${encodeURIComponent(filepath)}`);
    if (!res.ok) {
      return { ok: false, error: `Failed to read file: ${res.statusText}` };
    }
    const yamlText: string = await res.json();
    try {
      const fileState = fileToState(yamlText);
      this.dispatch(fileInit(fileState));
      const filename = filepath.split('/').pop() ?? filepath;
      this.dispatch(appSetPath({ filepath, filename }));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Failed to parse file: ${err}` };
    }
  }

  new(): ApiResult {
    this.dispatch(fileInit(getNewFileState()));
    this.dispatch(appSetPath({ filepath: '', filename: 'new-document.rq' }));
    return { ok: true };
  }

  override async open(): Promise<ApiResult> {
    const res = await fetch(`${this.baseUrl}/dialog/file/open`);
    if (!res.ok) {
      return { ok: false, error: `Failed to open dialog: ${res.statusText}` };
    }
    const { filepath }: { filepath: string | null } = await res.json();
    if (!filepath) return { ok: true };
    return this._load(filepath);
  }

  override async save(filepath?: string): Promise<ApiResult> {
    const state = store.getState();
    const targetPath = filepath ?? state.app.filepath;
    if (!targetPath) {
      return { ok: false, error: 'No file path. Use Save As to choose a location.' };
    }
    const content = storeToYaml(state.file.present);
    const res = await fetch(`${this.baseUrl}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filepath: targetPath, content }),
    });
    if (!res.ok) {
      return { ok: false, error: `Failed to save: ${res.statusText}` };
    }
    const filename = targetPath.split('/').pop() ?? targetPath;
    this.dispatch(appSetPath({ filepath: targetPath, filename }));
    return { ok: true };
  }

  override async saveAs(): Promise<ApiResult> {
    const res = await fetch(`${this.baseUrl}/dialog/file/save`);
    if (!res.ok) {
      return { ok: false, error: `Failed to open save dialog: ${res.statusText}` };
    }
    const { filepath }: { filepath: string | null } = await res.json();
    if (!filepath) return { ok: true };
    return this.save(filepath);
  }

  override async exportReqIf(): Promise<ApiResult> {
    const state = store.getState();
    const defaultName = (state.app.filename ?? 'document').replace(/\.rq$/, '') + '.reqif';
    const res = await fetch(`${this.baseUrl}/dialog/file/save?default_name=${encodeURIComponent(defaultName)}`);
    if (!res.ok) {
      return { ok: false, error: `Failed to open save dialog: ${res.statusText}` };
    }
    const { filepath }: { filepath: string | null } = await res.json();
    if (!filepath) return { ok: true };
    const params = mapToParams(state.file.present);
    const doc = new ReqIF(params).render();
    const content = formatXml(new XMLSerializer().serializeToString(doc));

    const writeRes = await fetch(`${this.baseUrl}/file`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filepath, content }),
    });
    if (!writeRes.ok) {
      return { ok: false, error: `Failed to export ReqIF: ${writeRes.statusText}` };
    }
    return { ok: true };
  }

  override async importReqIf(): Promise<ApiResult> {
    const res = await fetch(`${this.baseUrl}/dialog/file/open?accept=.reqif,.reqifz`);
    if (!res.ok) {
      return { ok: false, error: `Failed to open dialog: ${res.statusText}` };
    }
    const { filepath }: { filepath: string | null } = await res.json();
    if (!filepath) return { ok: true };

    const fileRes = await fetch(`${this.baseUrl}/file?filepath=${encodeURIComponent(filepath)}`);
    if (!fileRes.ok) {
      return { ok: false, error: `Failed to read file: ${fileRes.statusText}` };
    }
    const xmlText: string = await fileRes.json();
    try {
      const parsed = parseReqIF(xmlText);
      const fileState = reqIfToState(parsed);
      this.dispatch(fileInit(fileState));
      return { ok: true };
    } catch (err) {
      return { ok: false, error: `Failed to parse ReqIF: ${err}` };
    }
  }
}
