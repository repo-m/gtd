import { useSelector } from 'react-redux';
import { RootState } from '../store/store';

export function RawStoreView() {
  const fileState = useSelector((state: RootState) => state.file);
  return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, padding: 8 }}>
      {JSON.stringify(fileState, null, 2)}
    </pre>
  );
}
