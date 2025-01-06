import {Button} from "primereact/button";
import {getCurrentUrl, openInNewTab} from "../../../helpers/browser";
import {oidcConfig} from "../../../helpers/authSettings";
import React, {ReactElement} from "react";
import {AuthContextProps} from "react-oidc-context";
import {useSelector} from "react-redux";
import {RootState} from "../../../store/store";

type SsoAuthProps = {
    auth: AuthContextProps
};

function SsoSignInButtonComponent(props: SsoAuthProps): ReactElement {
    const themeState = useSelector((store: RootState) => store.theme);

    return <Button className="w-full" label="Sign In With Account Console"
                   onClick={() => props.auth.signinRedirect(
                       {
                           redirect_uri: getCurrentUrl(),
                           extraQueryParams: themeState as unknown as Record<string, string>
                       }
                   )} />;
}
export const SsoSignInButton = React.memo(SsoSignInButtonComponent);

function SsoSignOutButtonComponent(props: SsoAuthProps): ReactElement {
    return <Button className="w-full" label="Sign Out From Account Console" severity="warning"
                   onClick={() => {
                       props.auth.signoutRedirect({post_logout_redirect_uri: getCurrentUrl()}).then();
                   }}
                   loading={props.auth.isLoading} />;
}
export const SsoSignOutButton = React.memo(SsoSignOutButtonComponent);

function SsoAccountSettingsButtonComponent() {
    return <Button className="w-full" outlined label="Open Settings In Account Console"
                   onClick={() => openInNewTab(oidcConfig.authority + '/account')} />;
}
export const SsoAccountSettingsButton = React.memo(SsoAccountSettingsButtonComponent);

function SsoSignOutFormComponent(props: SsoAuthProps): ReactElement {
    return <div className="flex flex-column gap-3 align-items-center">
        <SsoSignOutButton auth={props.auth} />
        <SsoAccountSettingsButton />
    </div>;
}
export const SsoSignOutForm = React.memo(SsoSignOutFormComponent);
