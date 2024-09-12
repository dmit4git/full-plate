import React, {ReactElement, useEffect, useMemo} from 'react'; // react
// components
import {SlideBar} from "../../components/slide-bar/SlideBar";
// helpers
import {Position} from "../../helpers/enums";
import {ThemeSettings} from "./theme-settings/ThemeSettings";
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";
import {useAuth} from "react-oidc-context";
import {Button} from "primereact/button";
import {getCurrentUrl, openInNewTab} from "../../helpers/browser";
import {oidcConfig} from "../../helpers/authSettings";
import {SignUpForm} from "./native-auth/sign-up-form/SignUpForm";
import {SignInForm} from "./native-auth/sign-in-form/SignInForm";
import {SignOutForm} from "./native-auth/sign-out-form/SignOutForm";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {queryParams} from "../MainLayout";
import {mainLayoutControls} from "../MainLayoutControls";

function UserMenuComponent(): ReactElement {

    const userSlice = useSelector((store: RootState) => store.user);

    const auth = useAuth();

    const accountMenuTab = useMemo(() => new MenuTreeTab('Account', 'user', undefined, []), []);
    const themeMenuTab = new MenuTreeTab('Theme', 'user', <ThemeSettings />);

    const showEmailVerification = queryParams.get('overlay') === 'email-verification';
    useEffect(() => {
        if (showEmailVerification) {
            mainLayoutControls.rightSlideBar.show();
            if (!accountMenuTab) { return; }
            accountMenuTab.expand();
            const localAccountTab = accountMenuTab.findChildByHeader('Use App Native Account');
            if (!localAccountTab) { return; }
            localAccountTab.expand();
            localAccountTab.findChildByHeader('Create New Account')?.expand();
        }
    }, [showEmailVerification, accountMenuTab]);

    function makeSignInButton() {
        return <Button className="w-full" label="Sign In With Account Console"
                    onClick={() => auth.signinRedirect({redirect_uri: getCurrentUrl()})}
                    loading={auth.isLoading} />;
    }

    function makeSignOutButton() {
        return <Button className="w-full" label="Sign Out From Account Console" severity="warning"
                    onClick={() => {
                        auth.signoutRedirect({post_logout_redirect_uri: getCurrentUrl()}).then();
                    }}
                    loading={auth.isLoading} />;
    }

    function makeAccountSettingsButton() {
        return <Button className="w-full" outlined label="Open Settings In Account Console"
                    onClick={() => openInNewTab(oidcConfig.authority + '/account')} />;
    }

    function makeSsoSignOutForm() {
        return <div className="flex flex-column gap-3 align-items-center">
            {makeSignOutButton()}
            {makeAccountSettingsButton()}
        </div>;
    }

    const menuTabs: MenuTreeTab[] = [accountMenuTab, themeMenuTab];

    if (userSlice.signedIn || auth.activeNavigator === 'signoutRedirect') {
        accountMenuTab.children = [];
        if (userSlice.scheme === 'SSO') {
            accountMenuTab.content = makeSsoSignOutForm();
        } else if (userSlice.scheme === 'native') {
            accountMenuTab.content = <SignOutForm />;
        }
    } else {
        accountMenuTab.content = null;
        const index = accountMenuTab.findChildIndexByHeader('Use Account Console');
        const accountConsoleTab = new MenuTreeTab('Use Account Console', 'user', makeSignInButton());
        accountMenuTab.children!.splice(index >= 0 ? index : 0, 1, accountConsoleTab);
        if (!accountMenuTab.findChildByHeader('Use App Native Account')) {
            const signInFormTab = new MenuTreeTab('Sign In', 'user', <SignInForm />);
            const signUpFormTab = new MenuTreeTab('Create New Account', 'user');
            signUpFormTab.content = <SignUpForm tab={signUpFormTab}/>;
            const localAccountTab = new MenuTreeTab('Use App Native Account', 'user', undefined,
                [signInFormTab, signUpFormTab]);
            accountMenuTab.children!.push(localAccountTab);
        }

    }

    return <SlideBar position={Position.right}>
        <PanelTree tabs={menuTabs} />
    </SlideBar>;

}
export const UserMenu = React.memo(UserMenuComponent);
