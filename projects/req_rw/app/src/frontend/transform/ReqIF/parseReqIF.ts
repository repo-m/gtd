export interface ParsedReqIFObject {
  identifier: string;
  longName: string;
  values: Record<string, string>; // attrDef name -> value
}

export interface ParsedHierarchyNode {
  objectRef: string;
  children: ParsedHierarchyNode[];
}

export interface ParsedReqIFSpec {
  identifier: string;
  name: string;
  children: ParsedHierarchyNode[];
}

export interface ParsedReqIF {
  title: string;
  description: string;
  identifier: string;
  objects: Map<string, ParsedReqIFObject>;
  specifications: ParsedReqIFSpec[];
}

function childElements(parent: Element, localName: string): Element[] {
  return Array.from(parent.children).filter((c) => c.localName === localName);
}

function firstChild(parent: Element, localName: string): Element | undefined {
  return childElements(parent, localName)[0];
}

function textOf(parent: Element, localName: string): string {
  return firstChild(parent, localName)?.textContent?.trim() ?? '';
}

export function parseReqIF(xmlString: string): ParsedReqIF {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'application/xml');

  const parseError = doc.querySelector('parseerror');
  if (parseError) throw new Error(`XML parse error: ${parseError.textContent}`);

  // Header
  const headerEl = firstChild(doc.documentElement, 'THE-HEADER');
  const reqIfHeaderEl = headerEl ? firstChild(headerEl, 'REQ-IF-HEADER') : undefined;
  const identifier = reqIfHeaderEl?.getAttribute('IDENTIFIER') ?? crypto.randomUUID();
  const title = reqIfHeaderEl ? textOf(reqIfHeaderEl, 'TITLE') : '';
  const description = reqIfHeaderEl ? textOf(reqIfHeaderEl, 'COMMENT') : '';

  // Build attrDef id -> name map from SPEC-TYPES
  const attrDefNames = new Map<string, string>();
  const coreContentEl = firstChild(doc.documentElement, 'CORE-CONTENT');
  const reqIfContentEl = coreContentEl ? firstChild(coreContentEl, 'REQ-IF-CONTENT') : undefined;

  if (reqIfContentEl) {
    const specTypesEl = firstChild(reqIfContentEl, 'SPEC-TYPES');
    if (specTypesEl) {
      for (const child of Array.from(specTypesEl.children)) {
        const specAttrsEl = firstChild(child, 'SPEC-ATTRIBUTES');
        if (!specAttrsEl) continue;
        for (const attrDef of Array.from(specAttrsEl.children)) {
          const attrId = attrDef.getAttribute('IDENTIFIER');
          const attrName = attrDef.getAttribute('NAME') ?? attrDef.getAttribute('LONG-NAME') ?? '';
          if (attrId) attrDefNames.set(attrId, attrName);
        }
      }
    }
  }

  // Parse SPEC-OBJECTS
  const objects = new Map<string, ParsedReqIFObject>();
  if (reqIfContentEl) {
    const specObjectsEl = firstChild(reqIfContentEl, 'SPEC-OBJECTS');
    if (specObjectsEl) {
      for (const soEl of childElements(specObjectsEl, 'SPEC-OBJECT')) {
        const objId = soEl.getAttribute('IDENTIFIER') ?? '';
        const longName = soEl.getAttribute('LONG-NAME') ?? '';
        const values: Record<string, string> = {};

        const valuesEl = firstChild(soEl, 'VALUES');
        if (valuesEl) {
          for (const avEl of Array.from(valuesEl.children)) {
            const defEl = firstChild(avEl, 'DEFINITION');
            const defRefEl = defEl ? Array.from(defEl.children)[0] : undefined;
            const defId = defRefEl?.textContent?.trim() ?? '';
            const attrName = attrDefNames.get(defId) ?? defId;

            // Value is either THE-VALUE attribute or THE-VALUE child
            const theValueAttr = avEl.getAttribute('THE-VALUE');
            const theValueEl = firstChild(avEl, 'THE-VALUE');
            const value = theValueAttr ?? theValueEl?.textContent ?? '';

            if (attrName) values[attrName] = value;
          }
        }

        if (objId) objects.set(objId, { identifier: objId, longName, values });
      }
    }
  }

  // Parse SPECIFICATIONS
  const specifications: ParsedReqIFSpec[] = [];
  if (reqIfContentEl) {
    const specificationsEl = firstChild(reqIfContentEl, 'SPECIFICATIONS');
    if (specificationsEl) {
      for (const specEl of childElements(specificationsEl, 'SPECIFICATION')) {
        const specId = specEl.getAttribute('IDENTIFIER') ?? '';
        const specName = specEl.getAttribute('NAME') ?? '';
        const childrenEl = firstChild(specEl, 'CHILDREN');
        const children = childrenEl ? parseHierarchy(childrenEl) : [];
        specifications.push({ identifier: specId, name: specName, children });
      }
    }
  }

  return { title, description, identifier, objects, specifications };
}

function parseHierarchy(el: Element): ParsedHierarchyNode[] {
  return childElements(el, 'SPEC-HIERARCHY').map((hierEl) => {
    const objEl = firstChild(hierEl, 'OBJECT');
    const objRefEl = objEl ? Array.from(objEl.children)[0] : undefined;
    const objectRef = objRefEl?.textContent?.trim() ?? '';
    const childrenEl = firstChild(hierEl, 'CHILDREN');
    const children = childrenEl ? parseHierarchy(childrenEl) : [];
    return { objectRef, children };
  });
}
