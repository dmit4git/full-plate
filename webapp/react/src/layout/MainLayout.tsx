// react
import React, { ReactElement } from "react";
// components
import { Header } from "./header/Header";
import { MainSection } from "./main-section/MainSection";
import { UserMenu } from "./user-menu/UserMenu";
import { useSearchParams } from "react-router-dom";
import { MainMenu } from "./main-menu/MainMenu";
import {hasAuthParams, useAuth} from "react-oidc-context";
import {getCurrentUrl} from "../helpers/browser";
import {User} from "oidc-client-ts";
import {ssoUserSignIn, ssoUserSignOut} from "./UserSlice";
import {useDispatch, useSelector} from "react-redux";
import {RootState} from "../store/store";

export let queryParams: URLSearchParams = new URLSearchParams();

function MainLayoutComponent(): ReactElement {

    let [searchParams] = useSearchParams();
    queryParams = searchParams;

    const userSlice = useSelector((store: RootState) => store.user);

    // try to automatically silently sign-in
    const auth = useAuth();
    const [hasTriedSignIn, setHasTriedSignIn] = React.useState<boolean>(false);
    const dispatch = useDispatch();
    React.useEffect(() => {
        const shouldDoSilentSignIn = !hasAuthParams() &&
            !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading &&
            !hasTriedSignIn;
        if (shouldDoSilentSignIn) {
            auth.signinSilent({redirect_uri: getCurrentUrl()}).then();
            setHasTriedSignIn(true);
        }
        auth.events.addUserLoaded( (user: User) => { dispatch(ssoUserSignIn(user)); });
        auth.events.addUserUnloaded(() => { dispatch(ssoUserSignOut()); });
    }, [auth, hasTriedSignIn, dispatch, userSlice.hasSignedOutOfSso]);

    return(
        <>
            <Header/>
            <MainMenu/>
            <MainSection/>
            <UserMenu/>
        </>
    );
}
export const MainLayout = React.memo(MainLayoutComponent);
