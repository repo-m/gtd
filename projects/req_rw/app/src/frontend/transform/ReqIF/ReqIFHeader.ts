import { el } from '../XMLElement';
import type { ReqIFHeader } from '../mapping';

export function buildHeader(doc: Document, header: ReqIFHeader): Element {
  const theHeader = el(doc, 'THE-HEADER');
  const reqIfHeader = el(doc, 'REQ-IF-HEADER', { IDENTIFIER: header.identifier });

  if (header.description) {
    const comment = el(doc, 'COMMENT');
    comment.textContent = header.description;
    reqIfHeader.appendChild(comment);
  }

  const ct = el(doc, 'CREATION-TIME');
  ct.textContent = header.creationTime;
  reqIfHeader.appendChild(ct);

  const toolId = el(doc, 'REQ-IF-TOOL-ID');
  toolId.textContent = header.toolId;
  reqIfHeader.appendChild(toolId);

  const version = el(doc, 'REQ-IF-VERSION');
  version.textContent = '1.2';
  reqIfHeader.appendChild(version);

  const srcToolId = el(doc, 'SOURCE-TOOL-ID');
  srcToolId.textContent = header.toolId;
  reqIfHeader.appendChild(srcToolId);

  const title = el(doc, 'TITLE');
  title.textContent = header.title;
  reqIfHeader.appendChild(title);

  theHeader.appendChild(reqIfHeader);
  return theHeader;
}
