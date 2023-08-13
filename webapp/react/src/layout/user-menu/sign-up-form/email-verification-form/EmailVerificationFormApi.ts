import {webApi} from "../../../../store/webApi";
import {EmailConfirmation} from "./EmailVerificationForm";

export const verifyEmailQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        verifyEmail: builder.query<void, EmailConfirmation>({
            query: (credentials) => ({
                url: 'auth/verify-email',
                method: 'POST',
                body: JSON.stringify(credentials),
                headers: {
                    'Content-type': 'application/json'
                }
            }),
        })
    })
})

export const { useLazyVerifyEmailQuery } = verifyEmailQuery;
