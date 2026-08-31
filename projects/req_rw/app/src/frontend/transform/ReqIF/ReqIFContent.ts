import { el } from '../XMLElement';
import { buildSpecObject } from './SpecElementWithAttributes';
import { buildSpecification } from './Specification';
import { buildDatatypeDefinitionBoolean } from './DatatypeDefinitionBoolean';
import { buildDatatypeDefinitionDate } from './DatatypeDefinitionDate';
import { buildDatatypeDefinitionEnumeration } from './DatatypeDefinitionEnumeration';
import { buildDatatypeDefinitionInteger } from './DatatypeDefinitionInteger';
import { buildDatatypeDefinitionReal } from './DatatypeDefinitionReal';
import { buildDatatypeDefinitionString } from './DatatypeDefinitionString';
import { buildDatatypeDefinitionXHTML } from './DatatypeDefinitionXHTML';
import type { ReqIFParams, ReqIFDatatype } from '../mapping';

function buildDatatypeElement(doc: Document, dt: ReqIFDatatype): Element {
  switch (dt.type) {
    case 'Boolean': return buildDatatypeDefinitionBoolean(doc, dt.identifier, dt.name, dt.lastChange);
    case 'Date': return buildDatatypeDefinitionDate(doc, dt.identifier, dt.name, dt.lastChange);
    case 'Enumeration': return buildDatatypeDefinitionEnumeration(doc, dt.identifier, dt.name, dt.lastChange);
    case 'Integer': return buildDatatypeDefinitionInteger(doc, dt.identifier, dt.name, dt.lastChange);
    case 'Real': return buildDatatypeDefinitionReal(doc, dt.identifier, dt.name, dt.lastChange);
    case 'XHTML': return buildDatatypeDefinitionXHTML(doc, dt.identifier, dt.name, dt.lastChange);
    default: return buildDatatypeDefinitionString(doc, dt.identifier, dt.name, dt.lastChange);
  }
}

export function buildCoreContent(doc: Document, params: ReqIFParams): Element {
  const { datatypes, specObjectType, specificationType, specObjects, specRelations, specifications } = params;
  const coreContent = el(doc, 'CORE-CONTENT');
  const reqIfContent = el(doc, 'REQ-IF-CONTENT');

  // DATATYPES — one element per distinct field type
  const datatypesEl = el(doc, 'DATATYPES');
  for (const dt of datatypes) {
    datatypesEl.appendChild(buildDatatypeElement(doc, dt));
  }
  reqIfContent.appendChild(datatypesEl);

  // SPEC-TYPES
  const specTypes = el(doc, 'SPEC-TYPES');

  const sotEl = el(doc, 'SPEC-OBJECT-TYPE', {
    IDENTIFIER: specObjectType.identifier,
    'LAST-CHANGE': specObjectType.lastChange,
    NAME: specObjectType.name,
  });
  const specAttrs = el(doc, 'SPEC-ATTRIBUTES');
  for (const attrDef of specObjectType.attrDefs) {
    const kind = attrDef.kind.toUpperCase();
    const adEl = el(doc, `ATTRIBUTE-DEFINITION-${kind}`, {
      IDENTIFIER: attrDef.identifier,
      'LAST-CHANGE': attrDef.lastChange,
      NAME: attrDef.name,
      'LONG-NAME': attrDef.name,
    });
    const typeEl = el(doc, 'TYPE');
    const refEl = el(doc, `DATATYPE-DEFINITION-${kind}-REF`);
    refEl.textContent = attrDef.datatypeRef;
    typeEl.appendChild(refEl);
    adEl.appendChild(typeEl);
    specAttrs.appendChild(adEl);
  }
  sotEl.appendChild(specAttrs);
  specTypes.appendChild(sotEl);

  const stEl = el(doc, 'SPECIFICATION-TYPE', {
    IDENTIFIER: specificationType.identifier,
    'LAST-CHANGE': specificationType.lastChange,
    NAME: specificationType.name,
  });
  specTypes.appendChild(stEl);
  reqIfContent.appendChild(specTypes);

  // SPEC-OBJECTS
  const specObjectsEl = el(doc, 'SPEC-OBJECTS');
  for (const so of specObjects) {
    specObjectsEl.appendChild(buildSpecObject(doc, so));
  }
  reqIfContent.appendChild(specObjectsEl);

  // SPEC-RELATIONS — built from req.links
  const specRelationsEl = el(doc, 'SPEC-RELATIONS');
  for (const rel of specRelations) {
    const relEl = el(doc, 'SPEC-RELATION', {
      IDENTIFIER: rel.identifier,
      'LAST-CHANGE': rel.lastChange,
    });
    const srcEl = el(doc, 'SOURCE');
    const srcRef = el(doc, 'SPEC-OBJECT-REF');
    srcRef.textContent = rel.sourceRef;
    srcEl.appendChild(srcRef);
    relEl.appendChild(srcEl);

    const tgtEl = el(doc, 'TARGET');
    const tgtRef = el(doc, 'SPEC-OBJECT-REF');
    tgtRef.textContent = rel.targetRef;
    tgtEl.appendChild(tgtRef);
    relEl.appendChild(tgtEl);

    specRelationsEl.appendChild(relEl);
  }
  reqIfContent.appendChild(specRelationsEl);

  // SPECIFICATIONS
  const specificationsEl = el(doc, 'SPECIFICATIONS');
  for (const spec of specifications) {
    specificationsEl.appendChild(buildSpecification(doc, spec));
  }
  reqIfContent.appendChild(specificationsEl);

  coreContent.appendChild(reqIfContent);
  return coreContent;
}
