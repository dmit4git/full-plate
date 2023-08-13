// react
import React, { ReactElement } from "react";
// components
import { Header } from "./header/Header";
import {MainSection, rootPlaceholder} from "./main-section/MainSection";
import { UserMenu } from "./user-menu/UserMenu";
import { SlideBar } from "../components/slide-bar/SlideBar";
import {createBrowserRouter, RouterProvider, useSearchParams} from "react-router-dom";
import {NotFoundPage} from "../routes/not-found-page/NotFoundPage";
import {Home} from "../routes/home/Home";

export let queryParams: URLSearchParams = new URLSearchParams();

function MainLayoutComponent(): ReactElement {

    let [searchParams, setSearchParams] = useSearchParams();
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
