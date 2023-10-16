import {webApi} from "../../../store/webApi";
import {GetUserPermissionsResponse, UserPermissionsData} from "./UserPermissionsDataHelper";

export interface PermissionsGetRequest {
    search?: string,
    first: number,
    last: number
}

export interface PermissionsPostRequest extends Omit<UserPermissionsData, 'username' | 'email'> {
    users: string[]
}

export const query = webApi.injectEndpoints({
    endpoints: builder => ({
        getUserPermissions: builder.query<GetUserPermissionsResponse, PermissionsGetRequest>({
            query: (params) => ({
                url: 'admin/permissions',
                method: 'GET',
                params: params
            }),
        }),
        setUserPermissions: builder.query<null, PermissionsPostRequest>({
            query: (userPermissions) => ({
                url: 'admin/permissions',
                method: 'POST',
                body: userPermissions,
                headers: { 'Content-type': 'application/json' }
            }),
        })
    })
})

export const { useLazyGetUserPermissionsQuery, useLazySetUserPermissionsQuery } = query;
