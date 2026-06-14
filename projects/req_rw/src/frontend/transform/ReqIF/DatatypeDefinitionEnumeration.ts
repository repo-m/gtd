import { el } from '../XMLElement';

export function buildDatatypeDefinitionEnumeration(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-ENUMERATION', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
