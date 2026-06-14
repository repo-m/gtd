import type { Req } from '../../store/file';
import { HeadingIcon } from '../Icon';

interface Props {
  req: Req;
}

export function IdField({ req }: Props) {
  const level = (req.level as number | undefined) ?? 0;
  const num = (req.num as string | undefined) ?? String(req.id);
  return (
    <div style={{ paddingLeft: level * 12, whiteSpace: 'nowrap' }}>
      {req.heading !== undefined && <HeadingIcon aria-hidden={true} style={{ marginRight: 4, verticalAlign: 'middle' }} />}
      {num}
    </div>
  );
}
