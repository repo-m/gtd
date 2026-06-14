import { el } from '../XMLElement';

export function buildDatatypeDefinitionReal(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-REAL', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
