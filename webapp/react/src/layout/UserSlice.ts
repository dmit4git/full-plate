import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {User} from "oidc-client-ts";
import {oidcStorageKey} from "../helpers/authSettings";

const storedUser = User.fromStorageString(sessionStorage.getItem(oidcStorageKey) || '{}');
const {profile, id_token} = storedUser;
const initialState = {profile: profile, id_token: id_token};
    function signInReducer(state: Partial<User>, action: PayloadAction<User>) {
    const user: User | void = action.payload;
    state.profile = user.profile;
    state.id_token = user.id_token;
}

function signOutReducer(state: Partial<User>) {
    state.profile = undefined;
    state.id_token = undefined;
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
