import { createSlice } from '@reduxjs/toolkit';
import { toast } from 'react-toastify';

const tostifySlice = createSlice({
    name: 'notificationMessage',
    initialState: {value: ""},
    reducers: {
        showError: (state, action) => {
            state.value = action.payload;
            toast.warn(action.payload);
        },
        showInfo: (state, action) => {
            state.value = action.payload;
            toast.success(action.payload);
        }
    }
});

export const { showError, showInfo } = tostifySlice.actions;

export default tostifySlice.reducer;