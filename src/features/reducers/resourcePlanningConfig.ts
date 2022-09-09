import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { ResourceDashboardResponse, ResourcePlanningConfig } from '../resourcePlanning/providers/types';

const initialState: {
  value: ResourcePlanningConfig | undefined;
  dashboardData: ResourceDashboardResponse[] | undefined;
} = {
  value: undefined,
  dashboardData: undefined
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
    },
    setDashboard: (state, action: PayloadAction<ResourceDashboardResponse[]>) => {
      state.dashboardData = action.payload;
    }
  }
});

export const { setConfig, removeConfig, setDashboard } = resourcePlanningConfigSlice.actions;

export default resourcePlanningConfigSlice.reducer;
