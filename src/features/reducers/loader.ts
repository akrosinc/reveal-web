import { createSlice } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'notificationMessage',
  initialState: { value: false },
  reducers: {
    showLoader: (state, action) => {
      state.value = action.payload;
    }
  }
});

export const { showLoader } = loaderSlice.actions;

export default loaderSlice.reducer;
