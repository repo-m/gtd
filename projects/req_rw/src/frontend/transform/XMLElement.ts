export const REQIF_NS = 'http://www.omg.org/spec/ReqIF/20110401/reqif.xsd';

export function el(doc: Document, tag: string, attrs: Record<string, string> = {}): Element {
  const e = doc.createElementNS(REQIF_NS, tag);
  for (const [k, v] of Object.entries(attrs)) e.setAttribute(k, v);
  return e;
}
