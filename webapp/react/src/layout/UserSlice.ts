import {createSlice, PayloadAction} from '@reduxjs/toolkit';

interface UserState {
    username: string | null,
    signedIn: boolean
}

const defaultState: UserState = {
    username: null,
    signedIn: false
}
const storedAccount = localStorage.getItem('account');
const initialState = storedAccount ? JSON.parse(storedAccount) as UserState : defaultState;

function signInReducer(state: UserState, action: PayloadAction<string | null>) {
    state.username = action.payload;
    state.signedIn = true;
    localStorage.setItem('account', JSON.stringify(state));
}

function signOutReducer(state: UserState) {
    state.signedIn = false;
    localStorage.removeItem('account');
    localStorage.removeItem('accessTree');
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        userSignIn: signInReducer,
        userSignOut: signOutReducer,
    }  
});

export const { 
    userSignIn,
    userSignOut
} = userSlice.actions;
