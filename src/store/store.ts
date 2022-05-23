import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loaderReducer from '../features/reducers/loader';

export const store = configureStore({
  reducer: {
    loader: loaderReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
