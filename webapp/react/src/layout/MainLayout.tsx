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
import {userSignIn, userSignOut} from "./UserSlice";
import {useDispatch} from "react-redux";

export let queryParams: URLSearchParams = new URLSearchParams();

function MainLayoutComponent(): ReactElement {

    let [searchParams] = useSearchParams();
    queryParams = searchParams;

    // try to automatically silently sign-in
    const auth = useAuth();
    const [hasTriedSignIn, setHasTriedSignIn] = React.useState<boolean>(false);
    const dispatch = useDispatch();
    React.useEffect(() => {
        const shouldDoSilenSignIn = !hasAuthParams() &&
            !auth.isAuthenticated && !auth.activeNavigator && !auth.isLoading &&
            !hasTriedSignIn;
        if (shouldDoSilenSignIn) {
            auth.signinSilent({redirect_uri: getCurrentUrl()}).then();
            setHasTriedSignIn(true);
        }
        auth.events.addUserLoaded(async (user: User) => { dispatch(userSignIn(user)); });
        auth.events.addUserUnloaded(async () => { dispatch(userSignOut()); });
    }, [auth, hasTriedSignIn, dispatch]);

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
