import type { ViewColumn } from '../store/file';

export const VIEW_MODE_TABLE = 'TABLE' as const;
export const VIEW_MODE_RAW = 'RAW' as const;
export const VIEW_MODE_FILE = 'FILE' as const;
export const VIEW_MODE_REGIF = 'REGIF' as const;

export const VIEW_DEFAULT_NAME = 'default';

export const VIEW_DEFAULT: ViewColumn[] = [
  { label: 'ID', field: 'id', width: 50 },
  { label: 'Requirements', field: 'content' },
  { label: 'Category', field: 'Category', width: 120 },
  { label: 'Links', field: 'links', width: 60 },
  { label: 'Status', field: 'Status', width: 120 },
];
