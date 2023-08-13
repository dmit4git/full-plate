import { webApi } from "../../../store/webApi";
import { UserCredentials } from "./SignInFormSlice";

export const signInQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        signIn: builder.query<{username: string}, UserCredentials>({
            query: (credentials) => ({
                url: 'auth/sign-in',
                method: 'POST',
                // body: makeFormBody(credentials),
                body: JSON.stringify(credentials),
                headers: {
                    // 'Content-type': 'application/x-www-form-urlencoded'
                    'Content-type': 'application/json'
                },
                // credentials: 'include',
                // withCredentials: true,
                // exposeHeaders: 'Set-Cookie',
            }),
        })
    })
})

export const { useLazySignInQuery } = signInQuery;
