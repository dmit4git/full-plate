import { configureStore } from '@reduxjs/toolkit'
import { signInFormSlice } from '../layout/user-menu/sign-in-form/SignInFormSlice';
import { signUpFormSlice } from '../layout/user-menu/sign-up-form/SignUpFormSlice';
import { themeSlice } from '../layout/user-menu/theme-settings/ThemeSlice';
import { userSlice } from "../layout/UserSlice";
import { webApi } from './webApi';

export const store = configureStore({
    reducer: {
        user: userSlice.reducer,
        signInForm: signInFormSlice.reducer,
        signUpForm: signUpFormSlice.reducer,
        theme: themeSlice.reducer,
        [webApi.reducerPath]: webApi.reducer
    },
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware().concat(webApi.middleware)
})

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
