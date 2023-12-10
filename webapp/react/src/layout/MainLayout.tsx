// react
import React, { ReactElement } from "react";
// components
import { Header } from "./header/Header";
import { MainSection } from "./main-section/MainSection";
import { UserMenu } from "./user-menu/UserMenu";
import { useSearchParams } from "react-router-dom";
import { MainMenu } from "./main-menu/MainMenu";

export let queryParams: URLSearchParams = new URLSearchParams();

function MainLayoutComponent(): ReactElement {

    let [searchParams] = useSearchParams();
    queryParams = searchParams;

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
