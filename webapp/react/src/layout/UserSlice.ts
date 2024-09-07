import {createSlice, current, PayloadAction} from '@reduxjs/toolkit';
import {User} from "oidc-client-ts";
import {oidcStorageKey} from "../helpers/authSettings";

type AccountState = {
    scheme?: 'SSO' | 'native',
    signedIn: boolean,
    username?: string | null,
    hasSignedOutOfSso?: boolean,
    profile?: User['profile'],
    accessToken?: User['access_token']
};

const nativeAccountJson = localStorage.getItem('account');
let initialState: AccountState = {signedIn: false};
if (nativeAccountJson) {
    try {
        const parsed = JSON.parse(nativeAccountJson);
        initialState.signedIn = parsed.signedIn || false;
        initialState.username = parsed.username;
        initialState.scheme = 'native';
    } catch (error) {
        if (error instanceof TypeError) {
            console.error(error);
        }
    }
} else {
    const storedUser = User.fromStorageString(sessionStorage.getItem(oidcStorageKey) || '{}');
    if (storedUser?.access_token) {
        initialState.signedIn = false;
        initialState.profile = storedUser.profile;
        initialState.accessToken = storedUser.access_token;
        initialState.username = initialState.profile?.preferred_username;
    }
}

function nativeUserSignInReducer(state: AccountState, action: PayloadAction<string | null>) {
    state.scheme = 'native';
    state.signedIn = true;
    state.username = action.payload;
    localStorage.setItem('account', JSON.stringify(state));
}

function nativeUserSignOutReducer(state: AccountState) {
    clearAccountState(state);
    localStorage.removeItem('account');
    localStorage.removeItem('accessTree');
}

function ssoSignInReducer(state: AccountState, action: PayloadAction<User>) {
    const user: User | void = action.payload;
    if (user) {
        state.scheme = 'SSO';
        state.profile = user.profile;
        state.accessToken = user.access_token;
        state.signedIn = true;
        state.username = state.profile?.preferred_username;
    } else {
        clearAccountState(state);
    }
    console.log('ssoSignInReducer(): ', current(state));
}

function ssoSignOutReducer(state: AccountState) {
    clearAccountState(state);
    state.hasSignedOutOfSso = true;
    console.log('ssoSignOutReducer(): ', current(state));
}

function clearAccountState(state: AccountState) {
    state.signedIn = false;
    state.username = undefined;
    state.profile = undefined;
    state.accessToken = undefined;
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        nativeUserSignIn: nativeUserSignInReducer, nativeUserSignOut: nativeUserSignOutReducer,
        ssoUserSignIn: ssoSignInReducer, ssoUserSignOut: ssoSignOutReducer
    }
});

export const {
    nativeUserSignIn, nativeUserSignOut,
    ssoUserSignIn, ssoUserSignOut
} = userSlice.actions;
