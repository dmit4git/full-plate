import "./NotFoundPage.scss";
import React, {ReactElement} from "react";
import {useRouteError} from "react-router-dom";

function NotFoundPageComponent(): ReactElement {

    const error = useRouteError();
    console.error(error);

    return(
        <div className="not-found-page flex flex-column align-items-center justify-content-center gap-3">
            <div>
                <span className="text-4xl text-primary mr-3">Whoops</span>
                <b className="text-8xl">404</b>
            </div>
            <p className="text-4xl text-primary">Page not found</p>
            <div className="text-2xl">Sorry, the page you're looking for does not exist.</div>
        </div>
    );
}
export const NotFoundPage = React.memo(NotFoundPageComponent);
