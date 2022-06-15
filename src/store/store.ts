import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loaderReducer from '../features/reducers/loader';
import darkModeReducer from '../features/reducers/darkMode';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    darkMode: darkModeReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
