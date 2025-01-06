import type { PageProps } from "keycloakify/login/pages/PageProps";
import type { KcContext } from "../KcContext";
import type { I18n } from "../i18n";

import "./LoginVerifyEmail.css";
import {getBaseUrl} from "../../helpers/UrlHelper";

import "../../../public/prime-themes/index-fonts.css";
import 'primeicons/primeicons.css';
import "primeflex/primeflex.css";
import {useEffect} from "react";
import {setTheme} from "../../helpers/ThemeSetter";
import {Messages} from "primereact/messages";
import {useMessageHandler} from "../../helpers/messagesHandlerHook";

export default function LoginVerifyEmail(props: PageProps<Extract<KcContext, { pageId: "login-verify-email.ftl" }>, I18n>) {
    const { kcContext, i18n, doUseDefaultCss, Template, classes } = props;

    const { msg } = i18n;

    const { url, user, realm } = kcContext;

    useEffect(() => { setTheme(); }, []);

    return (
        <div className="main-section-wrapper">
            <div className="main-section mx-auto">
                <div className="flex w-full justify-content-center align-items-center py-6 gap-4">
                    <img className="h-4rem" src={`${getBaseUrl()}/PancakesFullPlate.svg`} alt=""/>
                    <div className="text-primary uppercase text-6xl">
                        {msg("loginTitleHtml", realm.displayNameHtml)}
                    </div>
                </div>
                <Template
                    kcContext={kcContext}
                    i18n={i18n}
                    doUseDefaultCss={doUseDefaultCss}
                    // classes={classes}
                    displayInfo
                    headerNode={msg("emailVerifyTitle")}
                    infoNode={
                        <p className="instruction">
                            {msg("emailVerifyInstruction2")}
                            <br/>
                            <a href={url.loginAction}>{msg("doClickHere")}</a>
                            &nbsp;
                            {msg("emailVerifyInstruction3")}
                        </p>
                    }
                >
                    <Messages ref={useMessageHandler(kcContext.message)} pt={{detail: {className: "text-sm"}}} />
                    <p className="instruction text-color">{msg("emailVerifyInstruction1", user?.email ?? "")}</p>
                </Template>
            </div>
        </div>
    );
}
