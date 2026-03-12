import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import loaderReducer from '../features/reducers/loader';
import darkModeReducer from '../features/reducers/darkMode';
import resourcePlanningConfig from '../features/reducers/resourcePlanningConfig';
import instanceContextReducer from '../features/reducers/instanceContext';

export const store = configureStore({
  reducer: {
    loader: loaderReducer,
    darkMode: darkModeReducer,
    resourceConfig: resourcePlanningConfig,
    instanceContext: instanceContextReducer
  }
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
