import type { Middleware, MiddlewareAPI, Dispatch, UnknownAction } from 'redux';
import type { Req } from './file';
import {
  searchSetValue,
  searchStart,
  searchSetResults,
  searchClear,
  CharRange,
  SearchMatch,
  ResultMap,
} from './searchSlice';

type SearchableState = {
  file: { present: { requirements: { [id: number]: Req } } };
  search: { value: string };
};

function findRanges(text: string, query: string): CharRange[] {
  const ranges: CharRange[] = [];
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let idx = 0;
  while (idx <= text.length - query.length) {
    const found = lowerText.indexOf(lowerQuery, idx);
    if (found === -1) break;
    ranges.push({ start: found, end: found + query.length });
    idx = found + 1;
  }
  return ranges;
}

function runSearch(api: MiddlewareAPI<Dispatch<UnknownAction>, SearchableState>): void {
  const state = api.getState();
  const query = state.search.value.trim();

  if (!query) {
    api.dispatch(searchClear());
    return;
  }

  const results: SearchMatch[] = [];
  const resultMap: ResultMap = {};

  const reqs = Object.values(state.file.present.requirements);
  reqs.sort((a, b) => a.id - b.id);

  for (const req of reqs) {
    for (const [key, val] of Object.entries(req)) {
      if (key === 'id' || key === 'children' || typeof val !== 'string' || !val) continue;
      const ranges = findRanges(val, query);
      if (ranges.length > 0) {
        if (!resultMap[req.id]) resultMap[req.id] = {};
        resultMap[req.id][key] = ranges;
        for (const range of ranges) {
          results.push({ id: req.id, field: key, start: range.start, end: range.end, index: 0 });
        }
      }
    }
  }

  results.forEach((r, i) => {
    r.index = i;
  });

  api.dispatch(searchSetResults({ results, resultMap }));
}

let timerId: ReturnType<typeof setTimeout> | null = null;

export const searchMiddleware: Middleware<Record<string, never>, SearchableState> =
  (api) => (next) => (action) => {
    const result = next(action);

    if (searchSetValue.match(action)) {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      api.dispatch(searchClear());
      const term = action.payload.trim();
      if (term) {
        timerId = setTimeout(() => {
          timerId = null;
          runSearch(api);
        }, 150);
      }
    } else if (searchStart.match(action)) {
      if (timerId !== null) {
        clearTimeout(timerId);
        timerId = null;
      }
      api.dispatch(searchClear());
      runSearch(api);
    }

    return result;
  };
