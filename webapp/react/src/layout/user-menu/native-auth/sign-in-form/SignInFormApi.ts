import { webApi } from "../../../../store/webApi";
import { UserCredentials } from "./SignInFormSlice";
import {
    FetchBaseQueryError,
    QueryDefinition,
    QueryResultSelectorResult
} from "@reduxjs/toolkit/query";
import {BaseQueryFn} from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import {FetchArgs} from "@reduxjs/toolkit/dist/query/react";
import {FetchBaseQueryMeta} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";

export const signInQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        signIn: builder.query<{username: string}, UserCredentials>({
            query: (credentials) => ({
                url: 'auth/sign-in',
                method: 'POST',
                // body: makeFormBody(credentials),
                body: credentials,
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

export type SignInQueryDefinition = QueryDefinition<UserCredentials, BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta>, never, {}, "webApi">;
export type SignInQueryResult = QueryResultSelectorResult<SignInQueryDefinition>;
