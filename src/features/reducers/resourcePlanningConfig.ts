import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResourcePlanningConfig } from '../resourcePlanning/providers/types';

const initialState: { value: ResourcePlanningConfig | undefined } = {
  value: undefined
};

const resourcePlanningConfigSlice = createSlice({
  name: 'resourcePlanningConfig',
  initialState: initialState,
  reducers: {
    setConfig: (state, action: PayloadAction<ResourcePlanningConfig>) => {
      state.value = action.payload;
    },
    removeConfig: state => {
      state.value = undefined;
    }
  }
});

export const { setConfig, removeConfig } = resourcePlanningConfigSlice.actions;

export default resourcePlanningConfigSlice.reducer;
