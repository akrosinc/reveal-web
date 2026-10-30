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
    interventionType: string;
  } | null;
  role: RoleModel | null;
  groups: GroupModel[];
}

/** Permissions of the instance role plus the permissions of every role the user has through a group. */
export const getContextPermissions = (ctx?: InstanceContextModel | null): string[] => {
  const groupPermissions = (ctx?.groups || []).flatMap(group =>
    (group?.roles || []).flatMap(role => role?.permissions || [])
  );
  return Array.from(new Set([...(ctx?.role?.permissions || []), ...groupPermissions]));
};

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
  // isLoading: nothing persisted yet, so the context (and its permissions) is still being fetched after login
  initialState: { ...getPersistedContext(), isLoading: !getFromBrowser(LOCAL_STORAGE_KEY) },
  reducers: {
    setCurrentInstance: (state, action: PayloadAction<InstanceContextModel>) => {
      setToBrowser(LOCAL_STORAGE_KEY, JSON.stringify(action.payload));
      state.selectedInstance = action.payload.selectedInstance;
      state.instancePlan = action.payload.instancePlan;
      state.role = action.payload.role;
      state.groups = action.payload.groups;
      state.isLoading = false;
    },
    clearCurrentInstance: state => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      state.selectedInstance = null;
      state.instancePlan = null;
      state.role = null;
      state.groups = [];
      state.isLoading = false;
    },
    stopInstanceContextLoading: state => {
      state.isLoading = false;
    }
  }
});


export const { setCurrentInstance, clearCurrentInstance, stopInstanceContextLoading } = instanceContextSlice.actions;

export default instanceContextSlice.reducer;
