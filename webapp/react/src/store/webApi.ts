import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { UserCredentials } from '../layout/user-menu/sign-in-form/SignInFormSlice';
import {FetchBaseQueryError, QueryStatus} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";

export const webApi = createApi({
    reducerPath: 'webApi',
    baseQuery: fetchBaseQuery({ 
        baseUrl: '/webapi/'
    }),
    endpoints: (builder) => ({
        helloWorld: builder.query<{value: string}, void>({
            query: () => ({
                url: 'hello-world',
                method: 'GET'
            }),
        })
    })
});

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

export const { useLazyHelloWorldQuery } = webApi;
