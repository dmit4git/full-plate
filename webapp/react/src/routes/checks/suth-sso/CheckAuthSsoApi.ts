import {webApi} from "../../../store/webApi";

export const authProtectionQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        unprotectedEndpoint: builder.query<{value: string}, void>({
            query: () => ({
                url: 'checks/unprotected-endpoint',
                method: 'GET'
            }),
        }),
        authenticatedEndpoint: builder.query<{value: string}, void>({
            query: () => ({
                url: 'checks/authentication-protected-endpoint',
                method: 'GET'
            }),
        }),
        roleProtectedEndpoint: builder.query<{value: string}, void>({
            query: () => ({
                url: 'checks/role-protected-endpoint',
                method: 'GET'
            }),
        })
    })
})

export const { useLazyUnprotectedEndpointQuery } = authProtectionQuery;
export const { useLazyAuthenticatedEndpointQuery } = authProtectionQuery;
export const { useLazyRoleProtectedEndpointQuery } = authProtectionQuery;
