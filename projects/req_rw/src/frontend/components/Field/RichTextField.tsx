import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '../../store/store';
import { fileUpdateReq } from '../../store/fileSlice';
import { selectSearchResultsByIdField } from '../../store/searchSlice';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';

interface Props {
  id: number;
  field: string;
  value: string | undefined;
  editable: boolean;
}

export function RichTextField({ id, field, value, editable }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const searchResults = useSelector(selectSearchResultsByIdField(id, field));
  return (
    <div onClick={editable ? (e) => e.stopPropagation() : undefined}>
      <RichTextEditor
        value={value ?? ''}
        editable={editable}
        onUpdate={(v) => dispatch(fileUpdateReq({ id, field, value: v }))}
        searchResults={searchResults}
      />
    </div>
  );
}
