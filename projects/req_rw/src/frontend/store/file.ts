import * as YAML from 'yaml';
import { FIELD_LIST_DEFAULT, INTERNAL_FIELDS, FieldType, FIELD_TYPES } from '../constants/field_constants';

export type { FieldType };

export interface FieldDef {
  name: string;
  type: FieldType;
  editable: boolean;
}

export interface ViewColumn {
  field: string;
  label: string;
  width?: number;
}

export interface NamedViewDef {
  columns: ViewColumn[];
}

export interface Req {
  id: number;
  heading?: string;
  text?: string;
  links?: unknown[];
  children: number[];
  [field: string]: unknown;
}

export interface FileState {
  identifier: string;
  title: string;
  prefix: string;
  description: string;
  max: number;
  next: number;
  root: number;
  requirements: { [id: number]: Req };
  views: Record<string, NamedViewDef>;
  fields: FieldDef[];
  types: unknown[];
  defaultView?: string;
}

export function yamlToJson(yaml: string): Record<string, unknown> {
  return YAML.parse(yaml) as Record<string, unknown>;
}

export function fileToState(yaml: string): FileState {
  const raw = yamlToJson(yaml);
  const reqArray = (raw.requirements as Req[] | undefined) ?? [];
  const requirements: { [id: number]: Req } = {};
  for (const req of reqArray) {
    requirements[req.id] = { ...FIELD_LIST_DEFAULT, ...req };
  }
  const max = (raw.max as number | undefined) ?? 0;
  return {
    identifier: (raw.identifier as string | undefined) ?? crypto.randomUUID(),
    title: (raw.title as string | undefined) ?? '',
    prefix: (raw.prefix as string | undefined) ?? 'REQ',
    description: (raw.description as string | undefined) ?? '',
    max,
    next: (raw.next as number | undefined) ?? max + 1,
    root: raw.root as number,
    requirements,
    views: (raw.views as Record<string, NamedViewDef> | undefined) ?? {},
    fields: (raw.fields as FieldDef[] | undefined) ?? [],
    types: (raw.types as unknown[] | undefined) ?? [],
    defaultView: raw.defaultView as string | undefined,
  };
}

export function stateToFile(state: FileState): Record<string, unknown> {
  const requirements = Object.values(state.requirements)
    .sort((a, b) => a.id - b.id)
    .map((req) => {
      const cleaned: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(req)) {
        if (!INTERNAL_FIELDS.has(key) && value !== undefined) {
          cleaned[key] = value;
        }
      }
      return cleaned;
    });

  const result: Record<string, unknown> = {
    identifier: state.identifier,
    title: state.title,
    prefix: state.prefix,
    description: state.description,
    max: state.max,
    root: state.root,
    requirements,
    views: state.views,
    fields: state.fields,
    types: (state.types as Array<{ type?: string }>).filter(t => (FIELD_TYPES as readonly string[]).includes(t.type ?? '')),
  };
  if (state.defaultView !== undefined) result.defaultView = state.defaultView;
  return result;
}

export function jsonToYaml(obj: unknown): string {
  return YAML.stringify(obj, { indent: 2, indentSeq: false });
}

export function storeToYaml(state: FileState): string {
  return jsonToYaml(stateToFile(state));
}

export function storeToSubFile(state: FileState, id: number): FileState {
  const subtreeIds = new Set<number>();
  const queue = [id];
  while (queue.length > 0) {
    const current = queue.shift()!;
    subtreeIds.add(current);
    const req = state.requirements[current];
    if (req) {
      for (const childId of req.children) queue.push(childId);
    }
  }

  const requirements: { [id: number]: Req } = {};
  for (const reqId of subtreeIds) {
    const req = state.requirements[reqId];
    if (!req) continue;
    requirements[reqId] = {
      ...req,
      children: req.children.filter((c) => subtreeIds.has(c)),
    };
  }

  const usedFieldNames = new Set<string>();
  for (const req of Object.values(requirements)) {
    for (const key of Object.keys(req)) {
      usedFieldNames.add(key);
    }
  }
  const fields = state.fields.filter((f) => usedFieldNames.has(f.name));

  return {
    identifier: state.identifier,
    title: state.title,
    prefix: state.prefix,
    description: state.description,
    max: state.max,
    next: state.next,
    root: id,
    requirements,
    views: {},
    fields,
    types: [],
  };
}

export function getNewFileState(): FileState {
  return {
    identifier: crypto.randomUUID(),
    title: 'New Document',
    prefix: 'REQ',
    description: '',
    max: 2,
    next: 3,
    root: 0,
    requirements: {
      0: { id: 0, children: [1] },
      1: { id: 1, heading: 'Section 1', children: [2] },
      2: { id: 2, text: '', children: [] },
    },
    views: {},
    fields: [],
    types: [],
  };
}
