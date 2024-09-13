import {User, UserManagerSettings, WebStorageStateStore} from "oidc-client-ts";
import {AuthProviderProps} from "react-oidc-context";

function onSignInCallback(callbackUser: User | void) {
    window.history.replaceState({}, document.title, window.location.pathname);
}

const {protocol, host} = window.location;
const appRootUrl = `${protocol}//accounts.${host}`;
const oidcStore = window.sessionStorage;

export const oidcConfig: UserManagerSettings & AuthProviderProps = {
    authority: `${appRootUrl}/realms/fullplate`,
    client_id: "fullplate-webapp",
    redirect_uri: appRootUrl,
    automaticSilentRenew: true,
    onSigninCallback: onSignInCallback, // replaced with auth.events.addUserLoaded() for silent renew
    userStore: new WebStorageStateStore({ store: oidcStore })
};

export const oidcStorageKey = `oidc.user:${oidcConfig.authority}:${oidcConfig.client_id}`;
