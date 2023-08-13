import "./SignInForm.scss";
import React, {ReactElement, useRef, useState} from "react";
import { useLazySignInQuery } from "./SignInFormApi";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../store/store";
import {UserCredentials, signInUsernameChange} from "./SignInFormSlice";
import { userSignIn } from "../../UserSlice";
import {getErrorCode, isConnectionError} from "../../../helpers/accessors";
import {FieldType, InputField} from "../../../components/form/input-field/InputField";
import {useForm} from "react-hook-form";
import {serverCommunicationError, unknownErrorMessage} from "../../../helpers/constants";
import {Button, ButtonProps} from "primereact/button";
import {Messages, MessagesMessage} from "primereact/messages";

function SignInFormComponent(): ReactElement {
    
    // global state
    const signInSlice = useSelector((store: RootState) => store.signInForm);
    const dispatch = useDispatch();

    // form
    const defaultValues = {username: signInSlice.username, password: signInSlice.password};
    const { control, formState, handleSubmit } =
        useForm<UserCredentials>({defaultValues: defaultValues, mode: "all"});
    const messagesRef = useRef<Messages>(null);
    const [buttonSeverity, setButtonSeverity] = useState<ButtonProps["severity"]>(undefined);

    // api
    const [signInTrigger, signInResult, signInLastPromiseInfo] = useLazySignInQuery();

    // sign user in on button click
    async function onSignInClick(data: UserCredentials) {
        clearError(); // reset form error
        const credentials: UserCredentials = { // create user data from form inputs
            username: data.username, password: data.password
        };
        const signInResult = await signInTrigger(credentials); // call backend to sign in
        if (signInResult.isError) {
            const errorCode = getErrorCode(signInResult);
            let errorMessage = undefined;
            if (errorCode === 'WrongCredentials') {
                errorMessage = 'wrong credentials';
            } else if (errorCode === 'EmailNotConfirmed') {
                errorMessage = {
                    severity: 'warn', summary: 'Error:', detail: 'account email is not verified', sticky: true, closable: true
                } as MessagesMessage
            } else if (isConnectionError(errorCode)) {
                errorMessage = serverCommunicationError;
            }
            setError(errorMessage); // show error under the button
        } else {
            dispatch(userSignIn(signInResult.data!.username)); // set global state for user
        }
    }

    function setError(error?: string | MessagesMessage) {
        let message: MessagesMessage;
        if (error && typeof error !== 'string') {
            message = error;
            if (error.severity === 'warn') {
                setButtonSeverity('warning');
            } else if (error.severity === 'error') {
                setButtonSeverity('danger');
            }
        } else {
            message = {
                severity: 'error', summary: 'Error:', detail: error || unknownErrorMessage, sticky: true, closable: true
            };
            setButtonSeverity('danger');
        }
        messagesRef.current?.show([message]);
    }

    function clearError() {
        setButtonSeverity(undefined);
        messagesRef.current?.clear();
    }

    function onInputChange(value: string) {
        // reset error state on input change
        setButtonSeverity(undefined);
    }

    return (
        <div className="sign-in-form flex flex-column gap-3">
            <InputField name="username" idPrefix="sign-in" control={control} required={true}
                        valueAction={signInUsernameChange} valueCallback={onInputChange}  />
            <InputField name="password" idPrefix="sign-in" control={control} required={true}
                        type={FieldType.password} valueCallback={onInputChange}  />
            <Button className="w-full mt-3" label="Sign In"
                    onClick={handleSubmit(onSignInClick)} loading={signInResult.isLoading} severity={buttonSeverity} />
            <Messages ref={messagesRef} />
        </div>
    )
}
export const SignInForm = React.memo(SignInFormComponent);
