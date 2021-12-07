import {createSlice} from '@reduxjs/toolkit';

interface User {
    email: string,
    email_verified: boolean,
    family_name: string,
    given_name: string,
    name: string,
    preferred_username: string,
    sub: string
}

const initialStateValue: User = {
    email: "",
    email_verified: false,
    family_name: "",
    given_name: "",
    name: "",
    preferred_username: "",
    sub: ""
};

const userSlice = createSlice({
    name: 'user',
    initialState: {value: initialStateValue},
    reducers: {
        login: (state, action) => {
            state.value = action.payload;
        },
        logout: (state, action) => {
            state.value = initialStateValue;
        }
    }
});

export const { login, logout } = userSlice.actions;

export default userSlice.reducer;