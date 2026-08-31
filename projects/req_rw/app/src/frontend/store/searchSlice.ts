import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './store';

export interface CharRange {
  start: number;
  end: number;
}

export interface SearchMatch {
  id: number;
  field: string;
  start: number;
  end: number;
  index: number;
}

export type ResultMap = { [reqId: number]: { [field: string]: CharRange[] } };

interface SearchState {
  isVisible: boolean;
  inProgress: boolean;
  value: string;
  results: SearchMatch[];
  resultMap: ResultMap;
  count: number;
  index: number;
}

const initialState: SearchState = {
  isVisible: false,
  inProgress: false,
  value: '',
  results: [],
  resultMap: {},
  count: 0,
  index: 0,
};

function clearResults(state: SearchState): void {
  state.results = [];
  state.resultMap = {};
  state.count = 0;
  state.index = 0;
  state.inProgress = false;
}

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    searchSetVisible(state, action: PayloadAction<boolean>) {
      state.isVisible = action.payload;
    },
    searchSetValue(state, action: PayloadAction<string>) {
      state.value = action.payload;
      state.inProgress = action.payload.trim().length > 0;
    },
    searchStart(_state) {
      // Signal only — middleware handles computation
    },
    searchSetResults(
      state,
      action: PayloadAction<{ results: SearchMatch[]; resultMap: ResultMap }>,
    ) {
      state.results = action.payload.results;
      state.resultMap = action.payload.resultMap;
      state.count = action.payload.results.length;
      state.index = 0;
      state.inProgress = false;
    },
    searchClear(state) {
      state.results = [];
      state.resultMap = {};
      state.count = 0;
      state.index = 0;
      // inProgress intentionally not cleared here; searchSetResults clears it
    },
    searchMoveIndex(state, action: PayloadAction<boolean>) {
      if (state.count === 0) return;
      const forward = action.payload;
      state.index = forward
        ? (state.index + 1) % state.count
        : (state.index - 1 + state.count) % state.count;
    },
    searchSetIndex(state, action: PayloadAction<number>) {
      if (state.count === 0) return;
      state.index = Math.max(0, Math.min(action.payload, state.count - 1));
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      (action) =>
        typeof action.type === 'string' &&
        (action.type === 'app/appSetContentMode' || action.type.startsWith('file/')),
      clearResults,
    );
  },
});

export const {
  searchSetVisible,
  searchSetValue,
  searchStart,
  searchSetResults,
  searchClear,
  searchMoveIndex,
  searchSetIndex,
} = searchSlice.actions;

export const selectSearchResultsByIdField =
  (id: number, field: string) =>
  (state: RootState): CharRange[] =>
    state.search.resultMap[id]?.[field] ?? [];

export default searchSlice.reducer;
