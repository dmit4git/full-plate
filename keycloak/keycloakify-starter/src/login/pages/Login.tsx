import {useEffect, useState} from "react";
import { kcSanitize } from "keycloakify/lib/kcSanitize";
import { clsx } from "keycloakify/tools/clsx";
import type { PageProps } from "keycloakify/login/pages/PageProps";
import { getKcClsx } from "keycloakify/login/lib/kcClsx";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import "../../../public/prime-themes/index-fonts.css";
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";

import "./Login.css";

import {FieldType, InputField} from "../../../../../webapp/react/src/components/form/input-field/InputField";
import { useForm } from "react-hook-form";
import { UserCredentials } from "../../../../../webapp/react/src/layout/user-menu/native-auth/sign-in-form/SignInFormSlice";
import { FormButton } from "../../../../../webapp/react/src/components/form/form-button/FormButton";
import {setTheme} from "../../helpers/ThemeSetter";
import {Messages} from "primereact/messages";
import {useMessageHandler} from "../../helpers/messagesHandlerHook";
import {LoginHeader} from "../../components/LoginHeader.tsx";


export default function Login(props: PageProps<Extract<KcContext, { pageId: "login.ftl" }>, I18n>) {

    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { kcClsx } = getKcClsx({
        doUseDefaultCss,
        classes
    });

    const { social, realm, url, usernameHidden, login, auth, registrationDisabled, messagesPerField } = kcContext;

    const { msg, msgStr } = i18n;

    const [isLoginButtonDisabled, setIsLoginButtonDisabled] = useState(false);

    const usernameFieldName = !realm.loginWithEmailAllowed
        ? msgStr("username")
        : !realm.registrationEmailAsUsername
            ? msgStr("usernameOrEmail")
            : msgStr("email");

    const passwordFieldName = msgStr("password");

    const defaultValues = {[usernameFieldName]: "", [passwordFieldName]: ""};
    const { control } = useForm<UserCredentials>({defaultValues: defaultValues, mode: "all"});

    useEffect(() => { setTheme(); }, []);

    const infoNode = (
        <div id="kc-registration-container">
            <div id="kc-registration">
                <span>
                    {msg("noAccount")}{" "}
                    <a tabIndex={8} href={url.registrationUrl}>
                        {msg("doRegister")}
                    </a>
                </span>
            </div>
        </div>
    );

    const socialProvidersNode = (
        <>
            {realm.password && social?.providers !== undefined && social.providers.length !== 0 && (
                <div id="kc-social-providers" className={kcClsx("kcFormSocialAccountSectionClass")}>
                    <hr />
                    <h2>{msg("identity-provider-login-label")}</h2>
                    <ul className={kcClsx("kcFormSocialAccountListClass", social.providers.length > 3 && "kcFormSocialAccountListGridClass")}>
                        {social.providers.map((...[p, , providers]) => (
                            <li key={p.alias}>
                                <a
                                    id={`social-${p.alias}`}
                                    className={kcClsx(
                                        "kcFormSocialAccountListButtonClass",
                                        providers.length > 3 && "kcFormSocialAccountGridItem"
                                    )}
                                    type="button"
                                    href={p.loginUrl}
                                >
                                    {p.iconClasses && <i className={clsx(kcClsx("kcCommonLogoIdP"), p.iconClasses)} aria-hidden="true"></i>}
                                    <span
                                        className={clsx(kcClsx("kcFormSocialAccountNameClass"), p.iconClasses && "kc-social-icon-text")}
                                        dangerouslySetInnerHTML={{ __html: kcSanitize(p.displayName) }}
                                    ></span>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </>
    );

    const templateForm = (
        <>
            <Messages ref={useMessageHandler(kcContext.message)} pt={{detail: {className: "text-sm"}}} />
            <div id="kc-form">
                <div id="kc-form-wrapper">
                    {realm.password && (
                        <form
                            id="kc-form-login"
                            onSubmit={() => {
                                setIsLoginButtonDisabled(true);
                                return true;
                            }}
                            action={url.loginAction}
                            method="post"
                        >
                            {/*{!usernameHidden && (*/}
                            {/*    <div className={kcClsx("kcFormGroupClass")}>*/}
                            {/*        <label htmlFor="username" className={kcClsx("kcLabelClass")}>*/}
                            {/*            {!realm.loginWithEmailAllowed*/}
                            {/*                ? msg("username")*/}
                            {/*                : !realm.registrationEmailAsUsername*/}
                            {/*                    ? msg("usernameOrEmail")*/}
                            {/*                    : msg("email")}*/}
                            {/*        </label>*/}
                            {/*        <input*/}
                            {/*            tabIndex={2}*/}
                            {/*            id="username"*/}
                            {/*            className={kcClsx("kcInputClass")}*/}
                            {/*            name="username"*/}
                            {/*            defaultValue={login.username ?? ""}*/}
                            {/*            type="text"*/}
                            {/*            autoFocus*/}
                            {/*            autoComplete="username"*/}
                            {/*            aria-invalid={messagesPerField.existsError("username", "password")}*/}
                            {/*        />*/}
                            {/*        {messagesPerField.existsError("username", "password") && (*/}
                            {/*            <span*/}
                            {/*                id="input-error"*/}
                            {/*                className={kcClsx("kcInputErrorMessageClass")}*/}
                            {/*                aria-live="polite"*/}
                            {/*                dangerouslySetInnerHTML={{*/}
                            {/*                    __html: kcSanitize(messagesPerField.getFirstError("username", "password"))*/}
                            {/*                }}*/}
                            {/*            />*/}
                            {/*        )}*/}
                            {/*    </div>*/}
                            {/*)}*/}

                            {/*<div className={kcClsx("kcFormGroupClass")}>*/}
                            {/*    <label htmlFor="password" className={kcClsx("kcLabelClass")}>*/}
                            {/*        {msg("password")}*/}
                            {/*    </label>*/}
                            {/*    <PasswordWrapper kcClsx={kcClsx} i18n={i18n} passwordInputId="password">*/}
                            {/*        <input*/}
                            {/*            tabIndex={3}*/}
                            {/*            id="password"*/}
                            {/*            className={kcClsx("kcInputClass")}*/}
                            {/*            name="password"*/}
                            {/*            type="password"*/}
                            {/*            autoComplete="current-password"*/}
                            {/*            aria-invalid={messagesPerField.existsError("username", "password")}*/}
                            {/*        />*/}
                            {/*    </PasswordWrapper>*/}
                            {/*    {usernameHidden && messagesPerField.existsError("username", "password") && (*/}
                            {/*        <span*/}
                            {/*            id="input-error"*/}
                            {/*            className={kcClsx("kcInputErrorMessageClass")}*/}
                            {/*            aria-live="polite"*/}
                            {/*            dangerouslySetInnerHTML={{*/}
                            {/*                __html: kcSanitize(messagesPerField.getFirstError("username", "password"))*/}
                            {/*            }}*/}
                            {/*        />*/}
                            {/*    )}*/}
                            {/*</div>*/}

                            {!usernameHidden &&
                                <InputField idPrefix="sign-in" required={true} control={control}
                                            name={usernameFieldName}
                                            inputProps={{name: "username"}}/>
                            }

                            <InputField name={passwordFieldName} control={control} className="pt-3"
                                        type={FieldType.password} required={true}
                                        inputProps={{name: "password"}}/>

                            <div className={kcClsx("kcFormGroupClass", "kcFormSettingClass", "mt-2", "text-sm")}>
                                <div id="kc-form-options">
                                    {realm.rememberMe && !usernameHidden && (
                                        <div className="checkbox">
                                            <label className="flex align-items-center">
                                                <input
                                                    tabIndex={5}
                                                    id="rememberMe"
                                                    name="rememberMe"
                                                    type="checkbox"
                                                    defaultChecked={!!login.rememberMe}
                                                />{" "}
                                                {msg("rememberMe")}
                                            </label>
                                        </div>
                                    )}
                                </div>
                                <div className={kcClsx("kcFormOptionsWrapperClass")}>
                                    {realm.resetPasswordAllowed && (
                                        <span>
                                        <a tabIndex={6} href={url.loginResetCredentialsUrl}>
                                            {msg("doForgotPassword")}
                                        </a>
                                    </span>
                                    )}
                                </div>
                            </div>

                            <div id="kc-form-buttons" className={kcClsx("kcFormGroupClass")}>
                                <input type="hidden" id="id-hidden-input" name="credentialId"
                                       value={auth.selectedCredential}/>
                                {/*<Button label={msgStr("doLogIn")}*/}
                                {/*        className="w-full"*/}
                                {/*        style={{fontSize: "14px"}}*/}
                                {/*        tabIndex={7}*/}
                                {/*        disabled={isLoginButtonDisabled}*/}
                                {/*        name="login"*/}
                                {/*        id="kc-login"*/}
                                {/*        type="submit"*/}
                                {/*/>*/}
                                <FormButton name="login" id="kc-login" type="submit"
                                            label={msgStr("doLogIn")} style={{fontSize: "16px"}}
                                            disabled={isLoginButtonDisabled}
                                            error={
                                                messagesPerField.existsError("username", "password") &&
                                                messagesPerField.getFirstError("username", "password") || null
                                            }
                                />
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </>
    );

    // realm.displayNameHtml = "fullplate"; // debug thingy

    return (
        <>
            <LoginHeader {...{i18n, realm}} />
            <Template
                kcContext={kcContext}
                i18n={i18n}
                doUseDefaultCss={doUseDefaultCss}

                displayMessage={!messagesPerField.existsError("username", "password")}
                headerNode={msg("loginAccountTitle")}
                displayInfo={realm.password && realm.registrationAllowed && !registrationDisabled}
                infoNode={infoNode}
                socialProvidersNode={socialProvidersNode}
            >
                {templateForm}
            </Template>
        </>
    );
}

// function PasswordWrapper(props: { kcClsx: KcClsx; i18n: I18n; passwordInputId: string; children: JSX.Element }) {
//     const {kcClsx, i18n, passwordInputId, children} = props;
//
//     const {msgStr} = i18n;
//
//     const [isPasswordRevealed, toggleIsPasswordRevealed] = useReducer((isPasswordRevealed: boolean) => !isPasswordRevealed, false);
//
//     useEffect(() => {
//         const passwordInputElement = document.getElementById(passwordInputId);
//
//         assert(passwordInputElement instanceof HTMLInputElement);
//
//         passwordInputElement.type = isPasswordRevealed ? "text" : "password";
//     }, [isPasswordRevealed]);
//
//     return (
//         <div className={kcClsx("kcInputGroup")}>
//             {children}
//             <button
//                 type="button"
//                 className={kcClsx("kcFormPasswordVisibilityButtonClass")}
//                 aria-label={msgStr(isPasswordRevealed ? "hidePassword" : "showPassword")}
//                 aria-controls={passwordInputId}
//                 onClick={toggleIsPasswordRevealed}
//             >
//                 <i className={kcClsx(isPasswordRevealed ? "kcFormPasswordVisibilityIconHide" : "kcFormPasswordVisibilityIconShow")}
//                    aria-hidden/>
//             </button>
//         </div>
//     );
// }
