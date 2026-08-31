import * as YAML from 'yaml';
import { FIELD_LIST_DEFAULT, INTERNAL_FIELDS, FieldType, FIELD_TYPES } from '../constants/field_constants';

export type { FieldType };

export interface FieldDef {
  name: string;
  type: FieldType;
  editable: boolean;
  values?: string[];
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
  root: number | null;
  requirements: { [id: number]: Req };
  fields: FieldDef[];
  types: unknown[];
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

  // Drop FieldDefs with unrecognised types
  const rawFields = (raw.fields as FieldDef[] | undefined) ?? [];
  const fields = rawFields.filter((f) => (FIELD_TYPES as readonly string[]).includes(f.type));

  // Root fallback: use first req id if root is absent or stale, null if no requirements
  const rawRoot = raw.root as number | null | undefined;
  const firstReqId = reqArray.length > 0 ? reqArray[0].id : null;
  const root: number | null =
    rawRoot != null && requirements[rawRoot] !== undefined ? rawRoot : firstReqId;

  return {
    identifier: (raw.identifier as string | undefined) ?? crypto.randomUUID(),
    title: (raw.title as string | undefined) ?? '',
    prefix: (raw.prefix as string | undefined) ?? 'REQ',
    description: (raw.description as string | undefined) ?? '',
    max,
    next: (raw.next as number | undefined) ?? max + 1,
    root,
    requirements,
    fields,
    types: (raw.types as unknown[] | undefined) ?? [],
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

  return {
    identifier: state.identifier,
    title: state.title,
    prefix: state.prefix,
    description: state.description,
    max: state.max,
    root: state.root,
    requirements,
    fields: state.fields,
    types: (state.types as Array<{ type?: string }>).filter(t => (FIELD_TYPES as readonly string[]).includes(t.type ?? '')),
  };
}

export function jsonToYaml(obj: unknown): string {
  return YAML.stringify(obj, { indent: 2, indentSeq: false });
}

export function storeToYaml(state: FileState): string {
  return jsonToYaml(stateToFile(state));
}

export function storeToSubFile(state: FileState, id: number | number[]): FileState {
  const ids = Array.isArray(id) ? Array.from(new Set(id)) : [id];

  const subtreeIds = new Set<number>();
  const queue = [...ids];
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

  const base = {
    identifier: state.identifier,
    title: state.title,
    prefix: state.prefix,
    description: state.description,
    max: state.max,
    next: state.next,
    fields,
    types: [] as unknown[],
  };

  // Single id: keep today's exact shape (root = the id itself, no sentinel) so
  // the OS-clipboard format and existing tests stay byte-for-byte compatible.
  if (ids.length === 1) {
    return { ...base, root: ids[0], requirements };
  }

  // Multiple ids: bake a real sentinel root (id -1) into `requirements` so the
  // returned FileState is already a valid single-root document — same shape
  // `BaseApi._wrapWithSentinel` produces for a single id at paste time. An id
  // that's already reachable as a descendant of another selected id in this
  // same batch is excluded from the sentinel's direct children so it isn't
  // listed twice in the tree — it stays at its original depth under its
  // selected ancestor.
  const nestedIds = new Set<number>();
  for (const req of Object.values(requirements)) {
    for (const childId of req.children) nestedIds.add(childId);
  }
  const topLevelIds = ids.filter((rid) => !nestedIds.has(rid));
  const sentinelId = -1;
  requirements[sentinelId] = { id: sentinelId, children: topLevelIds };

  return { ...base, root: sentinelId, requirements };
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
    fields: [
      { name: 'Status', type: 'Enumeration', editable: true, values: ['Draft', 'In Review', 'Approved', 'Deprecated'] },
      { name: 'Category', type: 'Enumeration', editable: true, values: ['Functional', 'Non-Functional', 'Safety', 'Interface', 'Performance'] },
    ],
    types: [],
  };
}
