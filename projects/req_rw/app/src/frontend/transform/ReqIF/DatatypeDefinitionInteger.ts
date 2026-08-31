import { el } from '../XMLElement';

export function buildDatatypeDefinitionInteger(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-INTEGER', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
