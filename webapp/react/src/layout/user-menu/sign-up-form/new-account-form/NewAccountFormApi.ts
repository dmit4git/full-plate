import { webApi } from "../../../../store/webApi";
import { UserAccount } from "./NewAccountFormSlice";
import {EmailVerificationStyles} from "./NewAccountForm";

export interface SignUpData {
    account: UserAccount,
    styles: EmailVerificationStyles
}

export const signUpQuery = webApi.injectEndpoints({
    endpoints: builder => ({
        signUp: builder.query<{username: string}, SignUpData>({
            query: (userInfo) => ({
                url: 'auth/sign-up',
                method: 'POST',
                body: JSON.stringify(userInfo),
                headers: { 'Content-type': 'application/json' },
            }),
        })
    })
})

export const { useLazySignUpQuery } = signUpQuery;
