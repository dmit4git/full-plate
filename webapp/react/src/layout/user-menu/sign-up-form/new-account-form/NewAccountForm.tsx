import React, {CSSProperties, ReactElement, useEffect, useRef, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "../../../../store/store";
import {signUpEmailChange, signUpUsernameChange, UserAccount } from "./NewAccountFormSlice";
import { useLazySignUpQuery } from "./NewAccountFormApi";
import {FieldType, InputField } from "../../../../components/form/input-field/InputField";
import {useForm} from "react-hook-form";
import {getCurrentQuery, getErrorCodes, isConnectionError} from "../../../../helpers/accessors";
import {ApiResponse} from "../../../../store/webApi";
import {serverCommunicationError, unknownErrorMessage} from "../../../../helpers/constants";
import {IPanelBranchContent} from "../../../../components/panel-tree/panel-branch/PanelBranch";
import {Button, ButtonProps} from "primereact/button";
import {Messages} from "primereact/messages";
import {queryParams} from "../../../MainLayout";

export interface EmailVerificationStyles {
    '--surface-f'?: string;
    '--text-color'?: string;
    '--primary-color'?: string;
    '--primary-color-text'?: string;
}

function NewAccountFormComponent(props: IPanelBranchContent): ReactElement {

    // globally stored values to initiate rerendered inputs
    const signUpSlice = useSelector((store: RootState) => store.signUpForm);

    const emailParam = queryParams.get('email');
    const usernameParam = queryParams.get('username');

    const dispatch = useDispatch();
    
    function onMount() {
        // update inputs from params
        if (emailParam) { dispatch(signUpEmailChange(emailParam)); }
        if (usernameParam) { dispatch(signUpUsernameChange(usernameParam)); }
    }
    useEffect(onMount, [queryParams]);

    // form
    const defaultValues = {
        email: emailParam || signUpSlice.email,
        username: usernameParam || signUpSlice.username,
        password: '',
        'repeat password': ''
    };
    const { control, formState, handleSubmit } =
        useForm<UserAccount>({defaultValues: defaultValues, mode: "all"});
    const messagesRef = useRef<Messages>(null);
    const [buttonSeverity, setButtonSeverity] = useState<ButtonProps["severity"]>(undefined);

    // api
    const [signUpTrigger, signUpResult, signUpLastPromiseInfo] = useLazySignUpQuery();
    
    // create new user and send email verification message 
    async function onSignUpClick(data: UserAccount) {
        // reset form errors
        clearError();
        const computedStyles = getComputedStyle(stylesDivRef.current!);
        const cssVariables: EmailVerificationStyles = {};
        for (let [cssProp, varName] of Object.entries(styles)) {
            varName = varName.replace(/^var\(([\w-]+)\)$/, '$1');
            cssVariables[varName as keyof EmailVerificationStyles] = computedStyles[cssProp as keyof CSSStyleDeclaration] as string;
        }
        // make credentials data from form inputs
        const account: UserAccount = {
            email:data.email, username: data.username, password: data.password,
            returnPath: getCurrentQuery()
        };
        // call backend
        const signUpResult = await signUpTrigger({account: account, styles: cssVariables});
        if (signUpResult.isError) {
            processErrors(signUpResult);
        } else {
            setButtonSeverity('success');
            if (props.onSuccess) {
                props.onSuccess(data);
            }
        }
    }

    function processErrors(signUpResult: ApiResponse) {
        clearError();
        const errorCodes = getErrorCodes(signUpResult);
        for (let errorCode of getErrorCodes(signUpResult)) {
            if (errorCode === 'DuplicateEmail') {
                // show error hint on email input
                control.setError('email', {type: 'taken'});
            } else if (errorCode === 'DuplicateUserName') {
                // show error hint on username input
                control.setError('username', {type: 'taken'});
            } else if (isConnectionError(errorCode)) {
                setError(serverCommunicationError);
            } else {
                setError();
            }
        }
    }

    function setError(error?: string) {
        setButtonSeverity('danger');
        messagesRef.current?.show([
            { severity: 'error', summary: 'Error:', detail: error || unknownErrorMessage, sticky: true, closable: true }
        ]);
    }

    function clearError() {
        setButtonSeverity(undefined);
        messagesRef.current?.clear();
    }

    function onInputChange(value: string) {
        setButtonSeverity(undefined); // reset button color
    }

    // styles to read calculated values from
    const stylesDivRef = useRef(null);
    const styles: CSSProperties = {
        backgroundColor: 'var(--surface-f)',
        color: 'var(--text-color)',
        accentColor: 'var(--primary-color)',
        floodColor:  'var(--highlight-bg)', // button background
        caretColor: 'var(--primary-color-text)' // button text
    };
    const stylesDiv = <div ref={stylesDivRef} style={styles}></div>    

    return (
        <>
            {stylesDiv}
            <div className="flex flex-column gap-3 mt-1">
                <InputField name="email" idPrefix="sign-up" type={FieldType.email} control={control}
                            required={true} valueAction={signUpEmailChange} valueCallback={onInputChange} />
                <InputField name="username" idPrefix="sign-up" control={control}
                            required={true} valueAction={signUpUsernameChange} valueCallback={onInputChange} />
                <InputField name="password" idPrefix="sign-up" control={control}
                            type={FieldType.password} passwordMeter={true} required={true} valueCallback={onInputChange} />
                <InputField name="repeat password" idPrefix="sign-up" control={control} match="password"
                            type={FieldType.password} required={true} valueCallback={onInputChange} />
                <Button className="w-full mt-3" label="Create Account"
                        onClick={handleSubmit(onSignUpClick)} loading={signUpResult.isLoading} severity={buttonSeverity} />
                <Messages ref={messagesRef} />
            </div>
        </>
    )
}
export const NewAccountForm = React.memo(NewAccountFormComponent);
