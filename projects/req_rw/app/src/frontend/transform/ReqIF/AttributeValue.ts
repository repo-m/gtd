import { el } from '../XMLElement';
import type { ReqIFAttrValue } from '../mapping';

const XHTML_NS = 'http://www.w3.org/1999/xhtml';

export function buildAttributeValue(doc: Document, val: ReqIFAttrValue): Element {
  const kind = val.kind.toUpperCase();
  const avEl = el(doc, `ATTRIBUTE-VALUE-${kind}`);

  const defEl = el(doc, 'DEFINITION');
  const defRef = el(doc, `ATTRIBUTE-DEFINITION-${kind}-REF`);
  defRef.textContent = val.defRef;
  defEl.appendChild(defRef);
  avEl.appendChild(defEl);

  if (val.kind === 'XHTML') {
    const theValue = el(doc, 'THE-VALUE');
    const div = doc.createElementNS(XHTML_NS, 'xhtml:div');
    div.textContent = val.value;
    theValue.appendChild(div);
    avEl.appendChild(theValue);
  } else {
    avEl.setAttribute('THE-VALUE', val.value);
  }

  return avEl;
}
