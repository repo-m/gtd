import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { fileUpdateReq } from '../../store/fileSlice';

interface Props {
  id: number;
  field: string;
  value: number | undefined;
  editable: boolean;
}

export function NumField({ id, field, value, editable }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  if (editable) {
    return (
      <input
        type="number"
        value={value ?? ''}
        style={{ width: '100%' }}
        onChange={(e) => dispatch(fileUpdateReq({ id, field, value: Number(e.target.value) }))}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return <span>{value ?? ''}</span>;
}
