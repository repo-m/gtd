import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';
import { selectAppFilters } from './appSlice';
import type { FieldDef } from './file';

function extractFilterValue(raw: unknown, fieldDef: FieldDef | undefined): string {
  if (raw == null) return '';
  if (fieldDef?.type === 'RichText' && typeof raw === 'string') {
    try {
      const texts: string[] = [];
      const walk = (node: { text?: string; children?: unknown[] }) => {
        if (node.text) texts.push(node.text);
        node.children?.forEach((c) => walk(c as { text?: string; children?: unknown[] }));
      };
      const parsed = JSON.parse(raw);
      walk(parsed.root ?? parsed);
      return texts.join(' ');
    } catch {
      return raw;
    }
  }
  if (fieldDef?.type === 'Links' && Array.isArray(raw)) {
    return raw
      .map((l) =>
        typeof l === 'number' ? String(l)
        : typeof l === 'string' ? l
        : (l as { label?: string; href?: string })?.label ?? '',
      )
      .join(' ');
  }
  return String(raw);
}

export const selectFileRoot = (state: RootState) => {
  const root = state.file.present.root;
  return root !== null ? state.file.present.requirements[root] : undefined;
};

export const selectFileRequirements = (state: RootState) => state.file.present.requirements;

export const selectFileReqList = createSelector(
  (state: RootState) => state.file.present.requirements,
  (state: RootState) => state.file.present.root,
  (requirements, root) => {
    const result: number[] = [];
    const stack = [root];
    while (stack.length > 0) {
      const id = stack.pop()!;
      result.push(id);
      const req = requirements[id];
      if (req) {
        for (let i = req.children.length - 1; i >= 0; i--) {
          stack.push(req.children[i]);
        }
      }
    }
    return result;
  },
);

export interface LinkEntry {
  label: string;
  href?: string;
}

export type FileLinkset = Record<number, { out: LinkEntry[]; in: LinkEntry[] }>;

function getValueForField(req: Record<string, unknown> & { id: number }, field: string, fieldMap: Map<string, FieldDef>): string {
  if (field === 'id') return String(req.id);
  if (field === 'content') {
    const parts: string[] = [];
    if (req.heading) parts.push(String(req.heading));
    if (req.text) parts.push(extractFilterValue(req.text, { name: 'text', type: 'RichText', editable: false }));
    return parts.join(' ');
  }
  if (field === 'links') return extractFilterValue(req.links, { name: 'links', type: 'Links', editable: false });
  return extractFilterValue(req[field], fieldMap.get(field));
}

export const selectFilteredReqList = createSelector(
  selectFileReqList,
  selectFileRequirements,
  selectAppFilters,
  (state: RootState) => state.file.present.fields,
  (ids, requirements, filters, fields) => {
    const activeFilters = Object.entries(filters);
    if (activeFilters.length === 0) return ids;
    const fieldMap = new Map(fields.map((f) => [f.name, f]));
    return ids.filter((id) => {
      const req = requirements[id];
      if (!req) return false;
      return activeFilters.every(([field, filter]) => {
        const value = getValueForField(req as Record<string, unknown> & { id: number }, field, fieldMap);
        if (filter.type === 'enum') return filter.include.includes(value);
        return value.toLowerCase().includes(filter.value.toLowerCase());
      });
    });
  },
);

export const selectFilteredReqCount = createSelector(
  selectFilteredReqList,
  (list) => list.length,
);

export const selectFileTotalReqCount = createSelector(
  selectFileReqList,
  (list) => list.length,
);

export const selectFilteredDisplayCount = createSelector(
  (state: RootState) => state.file.present.root,
  selectFilteredReqList,
  (root, list) => list.filter((id) => id !== root).length,
);

export const selectTotalDisplayCount = createSelector(
  (state: RootState) => state.file.present.root,
  selectFileReqList,
  (root, list) => list.filter((id) => id !== root).length,
);

export const selectFileLinkset = createSelector(
  (state: RootState) => state.file.present.requirements,
  (state: RootState) => state.file.present.prefix,
  (state: RootState) => state.app.filepath ?? state.file.present.identifier,
  (requirements, prefix, filepath): FileLinkset => {
    const linkset: FileLinkset = {};

    function ensure(id: number) {
      if (!linkset[id]) linkset[id] = { out: [], in: [] };
    }

    for (const req of Object.values(requirements)) {
      const links = req.links;
      if (!links || links.length === 0) continue;

      for (const link of links) {
        if (typeof link === 'number') {
          const sourceId = req.id;
          const targetId = link;
          ensure(sourceId);
          linkset[sourceId].out.push({
            label: `${prefix}-${targetId}`,
            href: `req://${filepath}#${sourceId}`,
          });
          ensure(targetId);
          linkset[targetId].in.push({ label: `${prefix}-${sourceId}` });
        } else if (typeof link === 'string') {
          ensure(req.id);
          linkset[req.id].out.push({ label: link, href: link });
        } else if (typeof link === 'object' && link !== null) {
          const obj = link as { label?: string; href?: string };
          ensure(req.id);
          linkset[req.id].out.push({ label: obj.label ?? '', href: obj.href });
        }
      }
    }

    return linkset;
  },
);
