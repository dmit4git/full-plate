import { webApi } from "../../../store/webApi";

export const signOutQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        signOut: builder.query<{username: string}, void>({
            query: (userInfo) => ({
                url: 'auth/sign-out',
                method: 'POST'
            }),
        })
    })
})

export const { useLazySignOutQuery } = signOutQuery;