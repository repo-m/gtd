import { el } from '../XMLElement';
import type { ReqIFSpecification, ReqIFHierarchyNode } from '../mapping';

function buildHierarchyNode(doc: Document, node: ReqIFHierarchyNode): Element {
  const h = el(doc, 'SPEC-HIERARCHY', {
    IDENTIFIER: node.identifier,
    'LAST-CHANGE': node.lastChange,
  });

  const objEl = el(doc, 'OBJECT');
  const objRef = el(doc, 'SPEC-OBJECT-REF');
  objRef.textContent = node.objectRef;
  objEl.appendChild(objRef);
  h.appendChild(objEl);

  if (node.children.length > 0) {
    const childrenEl = el(doc, 'CHILDREN');
    for (const child of node.children) childrenEl.appendChild(buildHierarchyNode(doc, child));
    h.appendChild(childrenEl);
  }

  return h;
}

export function buildSpecification(doc: Document, spec: ReqIFSpecification): Element {
  const specEl = el(doc, 'SPECIFICATION', {
    IDENTIFIER: spec.identifier,
    'LAST-CHANGE': spec.lastChange,
    NAME: spec.name,
  });

  const typeEl = el(doc, 'TYPE');
  const typeRef = el(doc, 'SPECIFICATION-TYPE-REF');
  typeRef.textContent = spec.typeRef;
  typeEl.appendChild(typeRef);
  specEl.appendChild(typeEl);

  if (spec.children.length > 0) {
    const childrenEl = el(doc, 'CHILDREN');
    for (const h of spec.children) childrenEl.appendChild(buildHierarchyNode(doc, h));
    specEl.appendChild(childrenEl);
  }

  return specEl;
}
