import { createSlice } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: { value: false, turnCount: 0, closeCount: 0 },
  reducers: {
    // count the turn and close times, loader should not be close till turn equals close count
    // this solves promise.all and multiple requests at same time closing loader before all requests are done
    showLoader: (state, action) => {
      if (action.payload) {
        state.turnCount++
      } else {
        state.closeCount++
      }
      if (state.turnCount > state.closeCount) {
        state.value = true;
      }
      if (state.turnCount <= state.closeCount) {
        state.value = false;
        state.turnCount = 0
        state.closeCount = 0
      }
    }
  }
});

export const { showLoader } = loaderSlice.actions;

export default loaderSlice.reducer;
