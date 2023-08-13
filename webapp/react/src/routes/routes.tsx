import {rootPlaceholder} from "../layout/main-section/MainSection";
import {NotFoundPage} from "./not-found-page/NotFoundPage";
import {Home} from "./home/Home";
import {MainLayout} from "../layout/MainLayout";
import React from "react";

export const routes = [
    {
        path: "/",
        element: <MainLayout/>,
        errorElement: <NotFoundPage />,
        children: [
            {
                path: "*",
                element: <NotFoundPage />,
            },
            {
                path: "",
                element: rootPlaceholder,
            },
            {
                path: "home",
                element: <Home />
            }
        ]
    }
];
