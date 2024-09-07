import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import {FetchBaseQueryError, QueryStatus} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {BaseQueryApi, FetchArgs} from "@reduxjs/toolkit/dist/query/react";
import {BaseQueryExtraOptions} from "@reduxjs/toolkit/src/query/baseQueryTypes";
import {BaseQueryFn} from "@reduxjs/toolkit/dist/query/baseQueryTypes";
import {FetchBaseQueryMeta} from "@reduxjs/toolkit/dist/query/fetchBaseQuery";
import Cookies from 'js-cookie';
import {isEmpty} from "lodash-es";
import {RootState} from "./store";

const baseQuery = fetchBaseQuery({
    baseUrl: '/webapi/',
    prepareHeaders: (headers: Headers,  { getState }) => {
    const token = (getState() as RootState).user.accessToken;
    if (token) {
        headers.set('Authorization', `Bearer ${token}`);
    }
    return headers;
}
});
async function baseQueryWrapper(args: string | FetchArgs, api: BaseQueryApi, extraOptions: BaseQueryExtraOptions<BaseQueryFn>) {
    const result = await baseQuery(args, api, extraOptions)
    const accessTree: any = Cookies.get('accessTree');
    if (accessTree && !isEmpty(accessTree)) {
        localStorage.setItem('accessTree', accessTree);
    }
    return result;
}
const apiBaseQuery: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError, {}, FetchBaseQueryMeta> = baseQueryWrapper;

export const webApi = createApi({
    reducerPath: 'webApi',
    baseQuery: apiBaseQuery,
    endpoints: (builder) => ({
        helloWorld: builder.query<{value: string}, void>({
            query: () => ({
                url: 'hello-world',
                method: 'GET'
            }),
        })
    })
});
export const { useLazyHelloWorldQuery } = webApi; // protected tryout query

export function makeFormBody(body: Record<string, string | number>): string {
    const bodyArray: string[] = [];
    for (let key in body) {
        var encodedKey = encodeURIComponent(key);
        var encodedValue = encodeURIComponent(body[key]);
        bodyArray.push(encodedKey + "=" + encodedValue);
    }
    return bodyArray.join("&");
}

export interface ApiResponse {
    status: QueryStatus,
    originalArgs?: any,
    data?: any,
    error?: FetchBaseQueryError | SerializedError,
    requestId?: string,
    endpointName?: string | undefined,
    startedTimeStamp?: number,
    fulfilledTimeStamp?: number
}
