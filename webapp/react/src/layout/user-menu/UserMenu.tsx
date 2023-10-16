import React, {ReactElement} from 'react'; // react
// components
import { SlideBar } from "../../components/slide-bar/SlideBar";
// helpers
import { Position } from "../../helpers/enums";
import { SignUpForm } from "./sign-up-form/SignUpForm";
import { ThemeSettings } from "./theme-settings/ThemeSettings";
import { Provider, useSelector} from 'react-redux';
import { RootState, store } from '../../store/store';
import { SignInForm } from './sign-in-form/SignInForm';
import { SignOutForm } from './sign-out-form/SignOutForm';
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";

export const accountMenuTab = new MenuTreeTab('Account', 'user', undefined, []);
export const signUpFormTab = new MenuTreeTab('Create New Account', 'user', <SignUpForm />);
export const signInFormTab = new MenuTreeTab('Sign In', 'user', <SignInForm />);
export const signOutFormTab = new MenuTreeTab('Sign Out', 'user', <SignOutForm />);
export const themeMenuTab = new MenuTreeTab('Theme', 'user', <ThemeSettings />);

function UserMenuComponent(): ReactElement {

    const userSlice = useSelector((store: RootState) => store.user);

    accountMenuTab.children = [];
    if (!userSlice.signedIn) {
        accountMenuTab.children!.push(signUpFormTab, signInFormTab)
    } else {
        accountMenuTab.children!.push(signOutFormTab);
    }

    const menuTabs: MenuTreeTab[] = [
        accountMenuTab,
        themeMenuTab
    ];

    return <SlideBar position={Position.right}>
        <Provider store={store}>
            <PanelTree tabs={menuTabs} />
        </Provider>
    </SlideBar>;

}
export const UserMenu = React.memo(UserMenuComponent);
