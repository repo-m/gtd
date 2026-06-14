import type { ViewColumn } from '../store/file';

export const VIEW_MODE_TABLE = 'TABLE' as const;
export const VIEW_MODE_RAW = 'RAW' as const;
export const VIEW_MODE_FILE = 'FILE' as const;
export const VIEW_MODE_REGIF = 'REGIF' as const;

export const VIEW_DEFAULT_NAME = 'default';

export const VIEW_DEFAULT: ViewColumn[] = [
  { label: 'ID', field: 'id' },
  { label: 'Requirements', field: 'content' },
  { label: 'Links', field: 'links' },
];
