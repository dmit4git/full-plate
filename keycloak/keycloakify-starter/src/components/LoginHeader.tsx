import React from "react";
import {getBaseUrl} from "../helpers/UrlHelper.ts";
import {I18n} from "keycloakify/login/i18n";
import {KcContext} from "keycloakify/src/login/KcContext/KcContext.ts";

interface LoginHeaderProps {
    i18n: I18n,
    realm: KcContext['realm']
}

function LoginHeaderComponent(props: LoginHeaderProps) {
    const { i18n, realm } = props;

    return (
        <div className="flex w-full justify-content-center align-items-center py-6 gap-4">
            <div className="text-primary uppercase text-6xl">
                {i18n.msg("loginTitleHtml", realm.displayNameHtml)}
            </div>
            <img className="h-4rem" src={`${getBaseUrl()}/PancakesFullPlate.svg`} alt=""/>
        </div>
    );
}

export const LoginHeader = React.memo(LoginHeaderComponent);
