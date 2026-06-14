import { FileState, Req } from '../store/file';
import { APP_IDENTIFIER } from '../constants/app_constants';
import type { FieldType } from '../constants/field_constants';
import { v5 as uuidv5 } from 'uuid';

export type ReqIFDatatypeKind = 'Boolean' | 'Date' | 'Enumeration' | 'Integer' | 'Real' | 'String' | 'XHTML';

const FIELD_TO_REQIF: Partial<Record<FieldType, ReqIFDatatypeKind>> = {
  String: 'String',
  RichText: 'XHTML',
  Integer: 'Integer',
  Real: 'Real',
  Boolean: 'Boolean',
  Date: 'Date',
  Enumeration: 'Enumeration',
};

export interface ReqIFHeader {
  identifier: string;
  title: string;
  description: string;
  creationTime: string;
  toolId: string;
}

export interface ReqIFDatatype {
  identifier: string;
  name: string;
  lastChange: string;
  type: ReqIFDatatypeKind;
}

export interface ReqIFAttrDef {
  identifier: string;
  name: string;
  lastChange: string;
  datatypeRef: string;
  kind: ReqIFDatatypeKind;
}

export interface ReqIFAttrValue {
  defRef: string;
  value: string;
  kind: ReqIFDatatypeKind;
}

export interface ReqIFSpecObject {
  identifier: string;
  longName: string;
  lastChange: string;
  typeRef: string;
  values: ReqIFAttrValue[];
}

export interface ReqIFHierarchyNode {
  identifier: string;
  lastChange: string;
  objectRef: string;
  children: ReqIFHierarchyNode[];
}

export interface ReqIFSpecification {
  identifier: string;
  name: string;
  lastChange: string;
  typeRef: string;
  children: ReqIFHierarchyNode[];
}

export interface ReqIFSpecObjectType {
  identifier: string;
  name: string;
  lastChange: string;
  attrDefs: ReqIFAttrDef[];
}

export interface ReqIFSpecificationType {
  identifier: string;
  name: string;
  lastChange: string;
}

export interface ReqIFSpecRelation {
  identifier: string;
  lastChange: string;
  sourceRef: string;
  targetRef: string;
}

export interface ReqIFParams {
  header: ReqIFHeader;
  datatypes: ReqIFDatatype[];
  specObjectType: ReqIFSpecObjectType;
  specificationType: ReqIFSpecificationType;
  specObjects: ReqIFSpecObject[];
  specifications: ReqIFSpecification[];
  specRelations: ReqIFSpecRelation[];
}

// v5 DNS namespace (RFC 4122)
const DNS_NS = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
// Stable namespace for req-rw built-in types, derived from APP_IDENTIFIER
const APP_NS = uuidv5(APP_IDENTIFIER, DNS_NS);

function stableBuiltinId(name: string): string {
  return uuidv5(name, APP_NS);
}

function stableId(name: string, docId: string): string {
  return uuidv5(name, docId);
}

function isoNow(): string {
  return new Date().toISOString().replace(/\.\d{3}Z$/, '+00:00');
}

export function mapToParams(fileState: FileState): ReqIFParams {
  const now = isoNow();
  const docId = fileState.identifier;

  // Collect the set of ReqIF datatype kinds needed.
  // Built-in fields heading (String) and text (XHTML) are always present.
  const kindToId = new Map<ReqIFDatatypeKind, string>();

  function ensureBuiltinKind(kind: ReqIFDatatypeKind) {
    if (!kindToId.has(kind)) {
      kindToId.set(kind, stableBuiltinId(`datatype:${kind.toLowerCase()}`));
    }
  }

  ensureBuiltinKind('String');
  ensureBuiltinKind('XHTML');

  for (const field of fileState.fields) {
    const kind = FIELD_TO_REQIF[field.type];
    if (!kind || kindToId.has(kind)) continue;
    // Enumeration types are document-specific; all others are built-in
    const id = kind === 'Enumeration'
      ? stableId(`datatype:${kind.toLowerCase()}`, docId)
      : stableBuiltinId(`datatype:${kind.toLowerCase()}`);
    kindToId.set(kind, id);
  }

  const specObjTypeId = stableId('spec-object-type', docId);
  const specTypeId = stableId('specification-type', docId);
  const specId = stableId('specification', docId);

  const header: ReqIFHeader = {
    identifier: stableId('header', docId),
    title: fileState.title,
    description: fileState.description,
    creationTime: now,
    toolId: APP_IDENTIFIER,
  };

  const datatypes: ReqIFDatatype[] = [];
  for (const [kind, identifier] of kindToId) {
    datatypes.push({ identifier, name: kind, lastChange: now, type: kind });
  }

  // Build attribute definitions for built-in fields then custom fields
  const attrDefs: ReqIFAttrDef[] = [
    {
      identifier: stableId('attrdef:heading', docId),
      name: 'Heading',
      lastChange: now,
      datatypeRef: kindToId.get('String')!,
      kind: 'String',
    },
    {
      identifier: stableId('attrdef:text', docId),
      name: 'Text',
      lastChange: now,
      datatypeRef: kindToId.get('XHTML')!,
      kind: 'XHTML',
    },
  ];

  for (const field of fileState.fields) {
    const kind = FIELD_TO_REQIF[field.type];
    const dtId = kind ? kindToId.get(kind) : undefined;
    if (!kind || !dtId) continue;
    attrDefs.push({
      identifier: stableId(`attrdef:${field.name}`, docId),
      name: field.name,
      lastChange: now,
      datatypeRef: dtId,
      kind,
    });
  }

  const specObjectType: ReqIFSpecObjectType = {
    identifier: specObjTypeId,
    name: 'Requirement',
    lastChange: now,
    attrDefs,
  };

  const specificationType: ReqIFSpecificationType = {
    identifier: specTypeId,
    name: 'Specification',
    lastChange: now,
  };

  const reqToObjId = new Map<number, string>();
  const specObjects: ReqIFSpecObject[] = [];

  for (const req of Object.values(fileState.requirements)) {
    if (req.id === fileState.root) continue;
    const objId = stableId(`req:${req.id}`, docId);
    reqToObjId.set(req.id, objId);

    const values: ReqIFAttrValue[] = [];
    if (req.heading) {
      values.push({ defRef: attrDefs[0].identifier, value: req.heading, kind: 'String' });
    }
    if (req.text) {
      values.push({ defRef: attrDefs[1].identifier, value: req.text as string, kind: 'XHTML' });
    }
    for (let i = 2; i < attrDefs.length; i++) {
      const attrDef = attrDefs[i];
      const fieldVal = req[attrDef.name];
      if (fieldVal !== undefined && fieldVal !== null && fieldVal !== '') {
        values.push({ defRef: attrDef.identifier, value: String(fieldVal), kind: attrDef.kind });
      }
    }

    specObjects.push({
      identifier: objId,
      longName: req.heading ?? `${fileState.prefix}-${req.id}`,
      lastChange: now,
      typeRef: specObjTypeId,
      values,
    });
  }

  // Build spec relations from numeric req.links
  const specRelations: ReqIFSpecRelation[] = [];
  for (const req of Object.values(fileState.requirements)) {
    if (!req.links || req.links.length === 0) continue;
    const sourceRef = reqToObjId.get(req.id);
    if (!sourceRef) continue;
    for (const link of req.links) {
      if (typeof link === 'number') {
        const targetRef = reqToObjId.get(link);
        if (!targetRef) continue;
        specRelations.push({
          identifier: stableId(`relation:${req.id}:${link}`, docId),
          lastChange: now,
          sourceRef,
          targetRef,
        });
      }
    }
  }

  function buildHierarchy(req: Req): ReqIFHierarchyNode[] {
    return req.children
      .map((childId) => {
        const child = fileState.requirements[childId];
        const objRef = reqToObjId.get(childId);
        if (!child || !objRef) return null;
        return {
          identifier: stableId(`hier:${childId}`, docId),
          lastChange: now,
          objectRef: objRef,
          children: buildHierarchy(child),
        } as ReqIFHierarchyNode;
      })
      .filter((n): n is ReqIFHierarchyNode => n !== null);
  }

  const rootReq = fileState.requirements[fileState.root];
  const specifications: ReqIFSpecification[] = [
    {
      identifier: specId,
      name: fileState.title || 'Specification',
      lastChange: now,
      typeRef: specTypeId,
      children: rootReq ? buildHierarchy(rootReq) : [],
    },
  ];

  return { header, datatypes, specObjectType, specificationType, specObjects, specifications, specRelations };
}
