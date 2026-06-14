import { el } from '../XMLElement';

export function buildDatatypeDefinitionBoolean(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-BOOLEAN', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
