import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from '../features/reducers/user';
import toastReducer from '../features/reducers/tostify';
import loaderReducer from '../features/reducers/loader';

export const store = configureStore({
  reducer: {
    user: userReducer,
    toast: toastReducer,
    loader: loaderReducer
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
