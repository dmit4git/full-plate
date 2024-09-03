import {rootPlaceholder} from "../layout/main-section/MainSection";
import {NotFoundPage} from "./not-found-page/NotFoundPage";
import {Home} from "./home/Home";
import {MainLayout} from "../layout/MainLayout";
import React from "react";
import {ErrorPage} from "./error-page/ErrorPage";
import {UserPermissions} from "../layout/main-section/user-permissions/UserPermissions";
import {NotAllowedPage} from "./not-allowed-page/NotAllowedPage";
import {CheckAuthSso} from "./checks/suth-sso/CheckAuthSso";

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
                path: "not-allowed",
                element: <NotAllowedPage />,
                errorElement: <ErrorPage />
            },
            {
                path: "home",
                element: <Home />,
                errorElement: <ErrorPage />
            },
            {
                path: "administration/user-permissions",
                element: <UserPermissions />,
                errorElement: <ErrorPage />
            },
            {
                path: "checks/endpoints-protection",
                element: <CheckAuthSso />,
                errorElement: <ErrorPage />
            }
        ]
    }
];
