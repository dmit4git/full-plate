import {createSlice, PayloadAction} from '@reduxjs/toolkit';

export type UserCredentials = {
    username: string,
    password: string
}

const initialState: UserCredentials = {
    username: '',
    password: ''
}

function signInUsernameChangeReducer(state: UserCredentials, action: PayloadAction<string>) {
    state.username = action.payload;
}

export const signInFormSlice = createSlice({
    name: 'signInForm',
    initialState,
    reducers: {signInUsernameChange: signInUsernameChangeReducer}
});

export const {signInUsernameChange} = signInFormSlice.actions;
