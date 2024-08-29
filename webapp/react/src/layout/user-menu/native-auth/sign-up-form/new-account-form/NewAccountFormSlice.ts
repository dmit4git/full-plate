import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import { UserCredentials } from '../../sign-in-form/SignInFormSlice';

export interface UserAccount extends UserCredentials {
    email: string,
    returnPath?: string,
    'password repeat'?: string
}

const initialState: UserAccount = {
    email: '',
    username: '',
    password: ''
}

function signUpEmailChangeReducer(state: UserAccount, action: PayloadAction<string>) {
    state.email = action.payload;
}

function signUpUsernameChangeReducer(state: UserAccount, action: PayloadAction<string>) {
    state.username = action.payload;
}

function signUpPasswordChangeReducer(state: UserAccount, action: PayloadAction<string>) {
    state.password = action.payload;
}

export const signUpFormSlice = createSlice({
    name: 'signUpForm',
    initialState,
    reducers: {
        signUpEmailChange: signUpEmailChangeReducer,
        signUpUsernameChange: signUpUsernameChangeReducer,
        signUpPasswordChange: signUpPasswordChangeReducer,
    }
});

export const {
    signUpEmailChange,
    signUpUsernameChange,
    signUpPasswordChange
} = signUpFormSlice.actions;
