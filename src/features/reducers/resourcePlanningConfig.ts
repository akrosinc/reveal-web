import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  ResourceDashboardRequest,
  ResourceDashboardResponse,
  ResourcePlanningConfig
} from '../resourcePlanning/providers/types';

interface DashboardResource {
  path: string[];
  request: ResourceDashboardRequest;
  response: ResourceDashboardResponse[];
}

const initialState: {
  value: ResourcePlanningConfig | undefined;
  dashboardData: DashboardResource | undefined;
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
    setDashboard: (state, action: PayloadAction<DashboardResource>) => {
      state.dashboardData = action.payload;
    }
  }
});

export const { setConfig, removeConfig, setDashboard } = resourcePlanningConfigSlice.actions;

export default resourcePlanningConfigSlice.reducer;
