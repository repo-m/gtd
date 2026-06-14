import { useDispatch } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { fileUpdateReq } from '../../store/fileSlice';
import { MarkableText } from '../MarkableText';

interface Props {
  id: number;
  field: string;
  value: string | undefined;
  editable: boolean;
}

export function SingleLinePlainTextField({ id, field, value, editable }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  if (editable) {
    return (
      <input
        type="text"
        value={value ?? ''}
        style={{ width: '100%' }}
        onChange={(e) => dispatch(fileUpdateReq({ id, field, value: e.target.value }))}
        onClick={(e) => e.stopPropagation()}
      />
    );
  }
  return <MarkableText id={id} field={field} value={value} />;
}
