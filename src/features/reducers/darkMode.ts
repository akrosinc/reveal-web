import { createSlice } from '@reduxjs/toolkit';
import { getFromBrowser, setToBrowser } from '../../utils';

const darkModeSlice = createSlice({
  name: 'darkMode',
  initialState: { value: JSON.parse(getFromBrowser('darkMode') || JSON.stringify(false)) },
  reducers: {
    setDarkMode: (state, action) => {
      setToBrowser('darkMode', action.payload);
      state.value = action.payload;
    }
  }
});

export const { setDarkMode } = darkModeSlice.actions;

export default darkModeSlice.reducer;
