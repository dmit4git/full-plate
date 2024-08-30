import React, {ReactElement} from 'react'; // react
// components
import { SlideBar } from "../../components/slide-bar/SlideBar";
// helpers
import { Position } from "../../helpers/enums";
import { ThemeSettings } from "./theme-settings/ThemeSettings";
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";
import {useAuth} from "react-oidc-context";
import {Button} from "primereact/button";
import {getCurrentUrl, openInNewTab} from "../../helpers/browser";
import {oidcConfig} from "../../helpers/authSettings";

function UserMenuComponent(): ReactElement {

    const auth = useAuth();

    const accountMenuTab = new MenuTreeTab('Account', 'user', undefined, []);
    const themeMenuTab = new MenuTreeTab('Theme', 'user', <ThemeSettings />);

    function makeSignInButton() {
        return <Button className="w-full" label="Sign In With Account Console"
                    onClick={() => auth.signinRedirect({redirect_uri: getCurrentUrl()})}
                    loading={auth.isLoading} />;
    }

    function makeSignOutButton() {
        return <Button className="w-full" label="Sign Out From Account Console" severity="warning"
                    onClick={() => {
                        accountMenuTab.collapse();
                        auth.signoutRedirect({post_logout_redirect_uri: getCurrentUrl()}).then();
                    }}
                    loading={auth.isLoading} />;
    }

    function makeAccountSettingsButton() {
        return <Button className="w-full" outlined label="Open Settings In Account Console"
                    onClick={() => openInNewTab(oidcConfig.authority + '/account')} />;
    }

    if (auth.isAuthenticated || auth.activeNavigator === 'signoutRedirect') {
        accountMenuTab.content = <div className="flex flex-column gap-3 align-items-center">
            {makeSignOutButton()}
            {makeAccountSettingsButton()}
        </div>;
    } else {
        accountMenuTab.content = makeSignInButton();
    }

    const menuTabs: MenuTreeTab[] = [
        accountMenuTab,
        themeMenuTab
    ];

    return <SlideBar position={Position.right}>
        <PanelTree tabs={menuTabs} />
    </SlideBar>;

}
export const UserMenu = React.memo(UserMenuComponent);
