import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '../../store/store';
import type { Req } from '../../store/file';
import { fileUpdateReq } from '../../store/fileSlice';
import { RichTextEditor } from '../RichTextEditor/RichTextEditor';
import { MarkableText } from '../MarkableText';

interface Props {
  id: number;
  req: Req;
  editable: boolean;
}

export function ContentField({ id, req, editable }: Props) {
  const dispatch = useDispatch<AppDispatch>();
  const level = (req.level as number | undefined) ?? 0;
  const indent = level * 16;

  const textSearchResults = useSelector(
    (state: RootState) => state.search.resultMap[id]?.['text'] ?? [],
  );

  if (req.heading !== undefined) {
    return (
      <div style={{ paddingLeft: indent, fontWeight: 600 }}>
        {editable ? (
          <input
            type="text"
            value={req.heading as string}
            style={{ width: '100%', fontWeight: 600 }}
            onChange={(e) =>
              dispatch(fileUpdateReq({ id, field: 'heading', value: e.target.value }))
            }
            onClick={(e) => e.stopPropagation()}
          />
        ) : (
          <MarkableText id={id} field="heading" value={req.heading as string} />
        )}
      </div>
    );
  }

  return (
    <div
      style={{ paddingLeft: indent }}
      onClick={editable ? (e) => e.stopPropagation() : undefined}
    >
      <RichTextEditor
        value={(req.text as string | undefined) ?? ''}
        editable={editable}
        onUpdate={(value) => dispatch(fileUpdateReq({ id, field: 'text', value }))}
        searchResults={textSearchResults}
      />
    </div>
  );
}
