// react
import React, { ReactElement } from "react";
// components
import { Header } from "./header/Header";
import { MainSection } from "./main-section/MainSection";
import { UserMenu } from "./user-menu/UserMenu";
import { SlideBar } from "../components/slide-bar/SlideBar";
import { useSearchParams } from "react-router-dom";

export let queryParams: URLSearchParams = new URLSearchParams();

function MainLayoutComponent(): ReactElement {

    let [searchParams] = useSearchParams();
    queryParams = searchParams;

    return(
        <>
            <Header/>
            <SlideBar/>
            <MainSection/>
            <UserMenu/>
        </>
    );
}
export const MainLayout = React.memo(MainLayoutComponent);
