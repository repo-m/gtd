import { createSelector } from '@reduxjs/toolkit';
import { RootState } from './store';

export const selectFileRoot = (state: RootState) =>
  state.file.present.requirements[state.file.present.root];

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
