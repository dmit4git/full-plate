import React, {CSSProperties, ReactElement} from "react";

function NotAllowedPageComponent(props: {style?: CSSProperties}): ReactElement {

    const style = {
        height: 'calc(100vh - 4rem)',
        background: 'var(--surface-f)'
    };

    return(
        <div className="not-found-page flex flex-column align-items-center justify-content-center gap-3"
             style={Object.assign(style, props.style)}>
            <div>
                <span className="text-4xl text-primary mr-3">Whoops</span>
                <b className="text-8xl">401 / 403</b>
            </div>
            <p className="text-4xl text-primary">Not authenticated / Unauthorized</p>
            <div className="text-2xl">Sorry, you're not allowed to access requested resource.</div>
        </div>
    );
}
export const NotAllowedPage = React.memo(NotAllowedPageComponent);
