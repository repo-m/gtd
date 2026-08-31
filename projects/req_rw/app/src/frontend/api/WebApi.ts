import { BaseApi, ApiResult, type Prefs, type FileViewState } from './BaseApi';
import { fileInit, fileSave } from '../store/fileSlice';
import { appSetPath } from '../store/appSlice';
import { fileToState, getNewFileState, storeToYaml } from '../store/file';
import { store } from '../store/store';
import { mapToParams } from '../transform/mapping';
import { ReqIF, formatXml } from '../transform/ReqIF/ReqIF';
import { parseReqIF } from '../transform/ReqIF/parseReqIF';
import { reqIfToState } from '../transform/ReqIF/reqIfToState';

export class WebApi extends BaseApi {
  override async init(): Promise<ApiResult> {
    window.addEventListener('focus', () => this.checkClipboard());
    try {
      const url = new URL('../../../samples/spec_lastenheft_req.rq', import.meta.url);
      const res = await fetch(url);
      if (!res.ok) {
        this.dispatch(fileInit(getNewFileState()));
        return { ok: false, error: `Failed to load demo file: ${res.statusText}` };
      }
      const text = await res.text();
      const state = fileToState(text);
      this.dispatch(fileInit(state));
      this.dispatch(appSetPath({ filepath: '', filename: 'spec_lastenheft_req.rq' }));
      return { ok: true };
    } catch (err) {
      this.dispatch(fileInit(getNewFileState()));
      this.dispatch(appSetPath({ filepath: '', filename: 'new-document.rq' }));
      return { ok: false, error: `Failed to load demo file: ${err}` };
    }
  }

  new(): ApiResult {
    this.dispatch(fileInit(getNewFileState()));
    this.dispatch(appSetPath({ filepath: '', filename: 'new-document.rq' }));
    return { ok: true };
  }

  async open(): Promise<ApiResult> {
    return new Promise<ApiResult>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.rq';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve({ ok: true });
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          try {
            const state = fileToState(text);
            this.dispatch(fileInit(state));
            this.dispatch(appSetPath({ filepath: file.name, filename: file.name }));
            resolve({ ok: true });
          } catch (err) {
            resolve({ ok: false, error: `Failed to parse file: ${err}` });
          }
        };
        reader.onerror = () => resolve({ ok: false, error: 'Failed to read file' });
        reader.readAsText(file);
      };
      input.click();
    });
  }

  override async getPrefs(): Promise<ApiResult<Prefs>> {
    try {
      const raw = localStorage.getItem('req_rw.prefs') ?? '{}';
      return { ok: true, data: JSON.parse(raw) as Prefs };
    } catch {
      return { ok: true, data: {} };
    }
  }

  override async saveFileState(key: string, state: FileViewState): Promise<ApiResult> {
    try {
      const current: Prefs = JSON.parse(localStorage.getItem('req_rw.prefs') ?? '{}');
      const merged: Prefs = {
        ...current,
        file_state: { ...(current.file_state ?? {}), [key]: state },
      };
      localStorage.setItem('req_rw.prefs', JSON.stringify(merged));
      return { ok: true };
    } catch {
      return { ok: false, error: 'Failed to save to localStorage' };
    }
  }

  override async save(): Promise<ApiResult> {
    const state = store.getState();
    const yaml = storeToYaml(state.file.present);
    const dataUri = `data:text/plain;charset=utf-8,${encodeURIComponent(yaml)}`;
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = state.app.filename ?? 'document.rq';
    a.click();
    this.dispatch(fileSave());
    return { ok: true };
  }

  override async exportReqIf(): Promise<ApiResult> {
    const state = store.getState();
    const params = mapToParams(state.file.present);
    const doc = new ReqIF(params).render();
    const xml = formatXml(new XMLSerializer().serializeToString(doc));
    const dataUri = `data:application/xml;charset=utf-8,${encodeURIComponent(xml)}`;
    const a = document.createElement('a');
    a.href = dataUri;
    a.download = (state.app.filename ?? 'document').replace(/\.rq$/, '') + '.reqif';
    a.click();
    return { ok: true };
  }

  override async importReqIf(): Promise<ApiResult> {
    return new Promise<ApiResult>((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.reqif,.reqifz';
      input.onchange = () => {
        const file = input.files?.[0];
        if (!file) {
          resolve({ ok: true });
          return;
        }
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          try {
            const parsed = parseReqIF(text);
            const fileState = reqIfToState(parsed);
            this.dispatch(fileInit(fileState));
            resolve({ ok: true });
          } catch (err) {
            resolve({ ok: false, error: `Failed to parse ReqIF: ${err}` });
          }
        };
        reader.onerror = () => resolve({ ok: false, error: 'Failed to read file' });
        reader.readAsText(file);
      };
      input.click();
    });
  }
}
