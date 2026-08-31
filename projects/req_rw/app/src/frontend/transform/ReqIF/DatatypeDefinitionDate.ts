import { el } from '../XMLElement';

export function buildDatatypeDefinitionDate(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-DATE', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
