import { useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { selectSearchResultsByIdField } from '../store/searchSlice';

interface Props {
  id: number;
  field: string;
  value: string | undefined;
}

export function MarkableText({ id, field, value }: Props) {
  const ranges = useSelector(selectSearchResultsByIdField(id, field));
  const activeMatch = useSelector(
    (state: RootState) => state.search.results[state.search.index],
  );

  const text = value ?? '';

  if (ranges.length === 0) {
    return <span>{text}</span>;
  }

  const sorted = [...ranges].sort((a, b) => a.start - b.start);
  const parts: React.ReactNode[] = [];
  let last = 0;

  for (const range of sorted) {
    if (range.start > last) {
      parts.push(text.slice(last, range.start));
    }
    const isActive =
      activeMatch?.id === id &&
      activeMatch?.field === field &&
      activeMatch?.start === range.start &&
      activeMatch?.end === range.end;
    parts.push(
      <mark
        key={range.start}
        className={isActive ? 'search-mark search-mark-active' : 'search-mark'}
      >
        {text.slice(range.start, range.end)}
      </mark>,
    );
    last = range.end;
  }

  if (last < text.length) {
    parts.push(text.slice(last));
  }

  return <span>{parts}</span>;
}
