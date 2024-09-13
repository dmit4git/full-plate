import React, {ReactElement, useEffect, useMemo} from 'react'; // react
// components
import {SlideBar} from "../../components/slide-bar/SlideBar";
// helpers
import {Position} from "../../helpers/enums";
import {ThemeSettings} from "./theme-settings/ThemeSettings";
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";
import {useAuth} from "react-oidc-context";
import {SignUpForm} from "./native-auth/sign-up-form/SignUpForm";
import {SignInForm} from "./native-auth/sign-in-form/SignInForm";
import {SignOutForm} from "./native-auth/sign-out-form/SignOutForm";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";
import {queryParams} from "../MainLayout";
import {mainLayoutControls} from "../MainLayoutControls";
import {SsoSignInButton, SsoSignOutForm} from "./sso-auth/SsoAuth";

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

    const menuTabs: MenuTreeTab[] = [accountMenuTab, themeMenuTab];

    if (userSlice.signedIn || auth.activeNavigator === 'signoutRedirect') {
        accountMenuTab.children = [];
        if (userSlice.scheme === 'SSO') {
            accountMenuTab.content = <SsoSignOutForm auth={auth} />;
        } else if (userSlice.scheme === 'native') {
            accountMenuTab.content = <SignOutForm />;
        }
    } else {
        accountMenuTab.content = null;
        const index = accountMenuTab.findChildIndexByHeader('Use Account Console');
        const accountConsoleTab = new MenuTreeTab('Use Account Console', 'user', <SsoSignInButton auth={auth} />);
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
