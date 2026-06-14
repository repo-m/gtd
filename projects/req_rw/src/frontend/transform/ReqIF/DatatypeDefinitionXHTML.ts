import { el } from '../XMLElement';

export function buildDatatypeDefinitionXHTML(
  doc: Document, identifier: string, name: string, lastChange: string,
): Element {
  return el(doc, 'DATATYPE-DEFINITION-XHTML', { IDENTIFIER: identifier, 'LAST-CHANGE': lastChange, NAME: name });
}
