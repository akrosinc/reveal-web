import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFromBrowser, setToBrowser } from '../../utils';

export interface InstanceModel {
  identifier: string;
  name: string;
}

export interface RoleModel {
  identifier: string | null;
  name: string | null;
  permissions: string[];
}

export interface GroupRoleModel {
  identifier: string;
  name: string;
  permissions: string[];
}

export interface GroupModel {
  identifier: string;
  name: string;
  type: string;
  roles: GroupRoleModel[];
}

export interface InstanceContextModel {
  selectedInstance: {
    identifier: string;
    name: string;
  } | null;
  instancePlan: {
    identifier: string;
    name: string;
  } | null;
  role: RoleModel | null;
  groups: GroupModel[];
}


const LOCAL_STORAGE_KEY = 'currentInstanceContext';

const getPersistedContext = (): InstanceContextModel => {
  try {
    const raw = getFromBrowser(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      selectedInstance: null,
      instancePlan: null,
      role: null,
      groups: []
    };
  } catch {
    return {
      selectedInstance: null,
      instancePlan: null,
      role: null,
      groups: []
    };
  }
};

const instanceContextSlice = createSlice({
  name: 'instanceContext',
  initialState: getPersistedContext(),
  reducers: {
    setCurrentInstance: (state, action: PayloadAction<InstanceContextModel>) => {
      setToBrowser(LOCAL_STORAGE_KEY, JSON.stringify(action.payload));
      state.selectedInstance = action.payload.selectedInstance;
      state.instancePlan = action.payload.instancePlan;
      state.role = action.payload.role;
      state.groups = action.payload.groups;
    },
    clearCurrentInstance: state => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      state.selectedInstance = null;
      state.instancePlan = null;
      state.role = null;
      state.groups = [];
    }
  }
});


export const { setCurrentInstance, clearCurrentInstance } = instanceContextSlice.actions;

export default instanceContextSlice.reducer;
