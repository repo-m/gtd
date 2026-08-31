import { configureStore } from '@reduxjs/toolkit';
import fileReducer from './fileSlice';
import appReducer from './appSlice';
import searchReducer from './searchSlice';
import { searchMiddleware } from './searchMiddleware';
import { createReqMiddleware } from './createReqMiddleware';

export const store = configureStore({
  reducer: {
    app: appReducer,
    file: fileReducer,
    search: searchReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(searchMiddleware, createReqMiddleware),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
