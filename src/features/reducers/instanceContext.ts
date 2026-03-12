import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { getFromBrowser, setToBrowser } from '../../utils';

export interface InstanceModel {
  identifier: string;
  name: string;
}

const LOCAL_STORAGE_KEY = 'currentInstance';

const getPersistedInstance = (): InstanceModel | null => {
  try {
    const raw = getFromBrowser(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const instanceContextSlice = createSlice({
  name: 'instanceContext',
  initialState: {
    currentInstance: getPersistedInstance() as InstanceModel | null
  },
  reducers: {
    setCurrentInstance: (state, action: PayloadAction<InstanceModel>) => {
      setToBrowser(LOCAL_STORAGE_KEY, JSON.stringify(action.payload));
      state.currentInstance = action.payload;
    },
    clearCurrentInstance: state => {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
      state.currentInstance = null;
    }
  }
});

export const { setCurrentInstance, clearCurrentInstance } = instanceContextSlice.actions;

export default instanceContextSlice.reducer;
