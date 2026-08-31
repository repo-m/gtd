import { REQIF_NS } from './XMLElement';

export function createReqIFDocument(): Document {
  const doc = document.implementation.createDocument(REQIF_NS, 'REQ-IF', null);
  const root = doc.documentElement;
  root.setAttribute('xmlns', REQIF_NS);
  root.setAttribute('xmlns:xsi', 'http://www.w3.org/2001/XMLSchema-instance');
  root.setAttribute('xsi:schemaLocation', `${REQIF_NS} reqif.xsd`);
  return doc;
}
