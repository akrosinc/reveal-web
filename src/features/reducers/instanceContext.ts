import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFromBrowser, setToBrowser } from '../../utils';

export interface InstanceModel {
  identifier: string;
  name: string;
}

export interface InstanceContextModel {
  selectedInstance: InstanceModel | null;
  roleIdentifier: string | null;
  roleName: string | null;
  permissions: string[];
}

const LOCAL_STORAGE_KEY = 'currentInstanceContext';

const getPersistedContext = (): InstanceContextModel => {
  try {
    const raw = getFromBrowser(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : {
      selectedInstance: null,
      roleIdentifier: null,
      roleName: null,
      permissions: []
    };
  } catch {
    return {
      selectedInstance: null,
      roleIdentifier: null,
      roleName: null,
      permissions: []
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
      state.roleIdentifier = action.payload.roleIdentifier;
      state.roleName = action.payload.roleName;
      state.permissions = action.payload.permissions;
    },
    clearCurrentInstance: state => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      state.selectedInstance = null;
      state.roleIdentifier = null;
      state.roleName = null;
      state.permissions = [];
    }
  }
});

export const { setCurrentInstance, clearCurrentInstance } = instanceContextSlice.actions;

export default instanceContextSlice.reducer;
