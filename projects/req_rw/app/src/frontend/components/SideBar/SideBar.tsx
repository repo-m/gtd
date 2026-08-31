import { ReqTree } from './ReqTree';

export function SideBar() {
  return (
    <div className="sidebar" style={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      <div className="sidebar-header">Structure</div>
      <ReqTree />
    </div>
  );
}
