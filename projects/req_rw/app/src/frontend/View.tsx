import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import { TableView } from './views/TableView/TableView';
import { RawStoreView } from './views/RawStoreView';
import { RawFileView } from './views/RawFileView';
import { RegIfView } from './views/RegIfView';

export function View() {
  const contentMode = useSelector((state: RootState) => state.app.contentMode);
  if (contentMode === 'TABLE') return <TableView />;
  if (contentMode === 'RAW') return <RawStoreView />;
  if (contentMode === 'FILE') return <RawFileView />;
  if (contentMode === 'REGIF') return <RegIfView />;
  return null;
}
