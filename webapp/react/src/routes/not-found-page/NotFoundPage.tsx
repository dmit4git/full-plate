import React, {CSSProperties, ReactElement} from "react";

function NotFoundPageComponent(props: {style?: CSSProperties}): ReactElement {

    const style = {
        height: 'calc(100vh - 4rem)',
        background: 'var(--surface-f)'
    };

    return(
        <div className="not-found-page flex flex-column align-items-center justify-content-center gap-3"
             style={Object.assign(style, props.style)}>
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
