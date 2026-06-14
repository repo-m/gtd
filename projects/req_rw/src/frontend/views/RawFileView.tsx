import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { storeToYaml } from '../store/file';

export function RawFileView() {
  const fileState = useSelector((state: RootState) => state.file.present);
  return (
    <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace', fontSize: 12, padding: 8 }}>
      {storeToYaml(fileState)}
    </pre>
  );
}
