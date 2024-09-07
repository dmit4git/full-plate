import React, { ReactElement, useEffect, useRef } from "react";
import { Divider } from "primereact/divider";
import { useLazyVerifyEmailQuery } from "./EmailVerificationFormApi";
import { Messages, MessagesMessage } from "primereact/messages";
import { ApiResponse } from "../../../../../store/webApi";
import { getErrorCodes } from "../../../../../helpers/accessors";
import { makeErrorMessage, makeWarningMessage } from "../../../../../helpers/makers";
import { useSearchParams } from "react-router-dom";
import { Button } from "primereact/button";
import {IPanelBranchContent} from "../../../../../components/panel-tree/panel-branch/PanelBranch";

export interface EmailConfirmation {
    username?: string | null;
    token?: string | null;
}
interface EmailConfirmFormProps {
    confirmation: EmailConfirmation | null,
    email: string,
    onSignInCallback?: () => void
}

function EmailConfirmFormComponent(props: EmailConfirmFormProps & IPanelBranchContent): ReactElement  {

    // api
    const [verificationEmailTrigger, verificationEmailResult] = useLazyVerifyEmailQuery();

    const messagesRef = useRef<Messages>(null);
    let [searchParams, setSearchParams] = useSearchParams();
    useEffect(queryEmailConfirmation, [
        messagesRef, verificationEmailTrigger, verificationEmailResult, props.confirmation, searchParams, setSearchParams
    ]);

    function queryEmailConfirmation() {
        const errors: MessagesMessage[] = [];
        function processErrors(response: ApiResponse) {
            messagesRef.current?.clear();
            for (let errorCode of getErrorCodes(response)) {
                if (errorCode === 'InvalidUsername') {
                    errors.push(makeErrorMessage('wrong username'));
                } else if (errorCode === 'InvalidToken') {
                    errors.push(makeErrorMessage('wrong email confirmation token'));
                } else if (errorCode === 'EmptyUsername') {
                    errors.push(makeErrorMessage('no username provided'));
                } else if (errorCode === 'EmptyToken') {
                    errors.push(makeErrorMessage('no email confirmation token provided'));
                } else if (errorCode === 'AlreadyVerified') {
                    errors.push(makeWarningMessage('the email is already verified'));
                } else {
                    errors.push(makeErrorMessage());
                }
            }
            messagesRef.current?.show(errors);
        }
        // shrugs off parameters for email verification
        function removeUsedSearchParameters() {
            searchParams.delete('overlay');
            searchParams.delete('email');
            searchParams.delete('username');
            searchParams.delete('email-verification');
            setSearchParams(searchParams);
        }

        if (!props.confirmation) { return; }
        if (verificationEmailResult.isUninitialized) {
            verificationEmailTrigger(props.confirmation);
        } else if (verificationEmailResult.isSuccess) {
            removeUsedSearchParameters();
        } else if (verificationEmailResult.isError) {
            processErrors(verificationEmailResult);
        }
    }

    function onSignInClick() {
        const newAccountPanel = props.tab;
        if (newAccountPanel) {
            newAccountPanel.collapse();
            newAccountPanel.parent?.findChildByHeader('Sign In')?.expand();
        }
        if (props.onSignInCallback) {
            props.onSignInCallback();
        }
    }

    let body: ReactElement;
    const emailClasses: string = "max-w-20rem text-center overflow-hidden white-space-nowrap text-overflow-ellipsis ";
    const email = <b className={emailClasses}>{props.email}</b>;
    if (!props.confirmation?.token) {
        body = <>
            <span className="text-center">Email verification message has been sent to</span>
            {email}
            <Divider />
            <span className="text-center">Please follow instructions provided in the message to complete creating new account</span>
        </>;
    } else {
        let verification: ReactElement;
        if (verificationEmailResult.isFetching) {
            verification = <div>
                <span className="text-center mr-3">Email verification is in progress </span>
                <i className="pi pi-spin pi-spinner"></i>
            </div>;
        } else {
            if (true || verificationEmailResult.isSuccess) {
                verification = <>
                    <div>Email verification is complete.</div>
                    <div className="flex align-items-center">
                        <span>You can</span>
                        <Button label="sign in" text onClick={onSignInClick} style={{padding: '0 0.25rem'}} />
                        <span>with this account now.</span>
                    </div>
                </>;
            } else {
                verification = <>
                    <div>Email verification has failed.</div>
                    <Divider />
                </>;
            }
        }
        body = <>
            {email}
            {verification}
        </>;
    }
    
    return <div>
        <div className="w-full h-full flex flex-column align-items-center justify-content-center gap-3">
            <i className="pi pi-at text-7xl text-primary mt-3"></i>
            {body}
        </div>
        <Messages ref={messagesRef} />
    </div>
}
export const EmailVerificationForm = React.memo(EmailConfirmFormComponent);
