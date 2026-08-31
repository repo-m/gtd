import type { ParsedReqIF, ParsedHierarchyNode } from './parseReqIF';
import type { FileState, Req } from '../../store/file';

export function reqIfToState(parsed: ParsedReqIF): FileState {
  let nextId = 1;
  const objIdToReqId = new Map<string, number>();

  // Allocate a req id for every spec object
  for (const objId of parsed.objects.keys()) {
    objIdToReqId.set(objId, nextId++);
  }

  const requirements: { [id: number]: Req } = {};

  // Build reqs from spec objects (children filled in by hierarchy pass below)
  for (const [objId, obj] of parsed.objects) {
    const reqId = objIdToReqId.get(objId)!;
    const heading = obj.values['Heading'];
    const text = obj.values['Text'];

    const req: Req = {
      id: reqId,
      children: [],
    };
    if (heading) req.heading = heading;
    if (text) req.text = text;

    requirements[reqId] = req;
  }

  // Build root req that holds the top-level hierarchy
  const rootId = 0;
  requirements[rootId] = { id: rootId, children: [] };

  // Wire up children from the first specification's hierarchy
  const spec = parsed.specifications[0];
  if (spec) {
    function wire(nodes: ParsedHierarchyNode[], parentId: number): void {
      for (const node of nodes) {
        const reqId = objIdToReqId.get(node.objectRef);
        if (reqId === undefined) continue;
        requirements[parentId].children.push(reqId);
        wire(node.children, reqId);
      }
    }
    wire(spec.children, rootId);
  }

  const max = nextId - 1;

  return {
    identifier: parsed.identifier || crypto.randomUUID(),
    title: parsed.title,
    prefix: 'REQ',
    description: parsed.description,
    max,
    next: max + 1,
    root: rootId,
    requirements,
    fields: [],
    types: [],
  };
}
