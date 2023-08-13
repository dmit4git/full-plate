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

function signInPasswordChangeReducer(state: UserCredentials, action: PayloadAction<string>) {
    state.password = action.payload;
}

export const signInFormSlice = createSlice({
    name: 'signInForm',
    initialState,
    reducers: {
        signInUsernameChange: signInUsernameChangeReducer,
        signInPasswordChange: signInPasswordChangeReducer,
    }
});

export const { 
    signInUsernameChange, 
    signInPasswordChange 
} = signInFormSlice.actions;
