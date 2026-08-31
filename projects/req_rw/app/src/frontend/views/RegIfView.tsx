import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { mapToParams } from '../transform/mapping';
import { ReqIF, formatXml } from '../transform/ReqIF/ReqIF';

function toReqIfXml(fileState: Parameters<typeof mapToParams>[0]): string {
  const params = mapToParams(fileState);
  const doc = new ReqIF(params).render();
  const raw = new XMLSerializer().serializeToString(doc);
  return formatXml(raw);
}

export function RegIfView() {
  const fileState = useSelector((state: RootState) => state.file.present);
  const xml = toReqIfXml(fileState);

  return (
    <div style={{ height: '100%', overflow: 'auto', padding: 16 }}>
      <pre
        style={{
          margin: 0,
          fontFamily: 'monospace',
          fontSize: 12,
          whiteSpace: 'pre',
          userSelect: 'text',
        }}
      >
        {xml}
      </pre>
    </div>
  );
}
