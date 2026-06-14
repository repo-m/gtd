import type { ReqIFParams } from '../mapping';
import { createReqIFDocument } from '../XMLDocument';
import { buildHeader } from './ReqIFHeader';
import { buildCoreContent } from './ReqIFContent';

export class ReqIF {
  constructor(private params: ReqIFParams) {}

  render(): Document {
    const doc = createReqIFDocument();
    const root = doc.documentElement;
    root.appendChild(buildHeader(doc, this.params.header));
    root.appendChild(buildCoreContent(doc, this.params));
    return doc;
  }
}

export function formatXml(xml: string): string {
  const lines = xml
    .replace(/></g, '>\n<')
    .replace(/>\n<\//g, '></')
    .split('\n');

  let indent = 0;
  const out: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    if (line.startsWith('</')) {
      indent = Math.max(0, indent - 1);
      out.push('  '.repeat(indent) + line);
    } else if (line.endsWith('/>') || line.includes('</')) {
      out.push('  '.repeat(indent) + line);
    } else if (line.startsWith('<') && !line.startsWith('<?') && !line.startsWith('<!')) {
      out.push('  '.repeat(indent) + line);
      indent++;
    } else {
      out.push('  '.repeat(indent) + line);
    }
  }

  return out.join('\n');
}
