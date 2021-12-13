import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import userReducer from '../features/reducers/user';
import toastReducer from '../features/reducers/tostify';

export const store = configureStore({
  reducer: {
    user: userReducer,
    toast: toastReducer
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
