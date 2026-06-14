import { el } from '../XMLElement';

export function buildDatatypeDefinitionString(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-STRING', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
