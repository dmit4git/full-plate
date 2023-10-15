import {rootPlaceholder} from "../layout/main-section/MainSection";
import {NotFoundPage} from "./not-found-page/NotFoundPage";
import {Home} from "./home/Home";
import {MainLayout} from "../layout/MainLayout";
import React from "react";
import {ErrorPage} from "./error-page/ErrorPage";

export const routes = [
    {
        path: "/",
        element: <MainLayout/>,
        errorElement: <ErrorPage style={{height: '100vh'}}/>,
        children: [
            {
                path: "*",
                element: <NotFoundPage />
            },
            {
                path: "",
                element: rootPlaceholder,
                errorElement: <ErrorPage />
            },
            {
                path: "home",
                element: <Home />,
                errorElement: <ErrorPage />
            }
        ]
    }
];
