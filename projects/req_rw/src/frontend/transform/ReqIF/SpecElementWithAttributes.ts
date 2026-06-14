import { el } from '../XMLElement';
import { buildAttributeValue } from './AttributeValue';
import type { ReqIFSpecObject } from '../mapping';

export function buildSpecObject(doc: Document, so: ReqIFSpecObject): Element {
  const soEl = el(doc, 'SPEC-OBJECT', {
    IDENTIFIER: so.identifier,
    'LAST-CHANGE': so.lastChange,
    'LONG-NAME': so.longName,
  });

  const typeEl = el(doc, 'TYPE');
  const typeRef = el(doc, 'SPEC-OBJECT-TYPE-REF');
  typeRef.textContent = so.typeRef;
  typeEl.appendChild(typeRef);
  soEl.appendChild(typeEl);

  if (so.values.length > 0) {
    const valuesEl = el(doc, 'VALUES');
    for (const val of so.values) {
      valuesEl.appendChild(buildAttributeValue(doc, val));
    }
    soEl.appendChild(valuesEl);
  }

  return soEl;
}
