import React, {CSSProperties, ReactElement} from "react";
import {useRouteError} from "react-router-dom";
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";

function ErrorPageComponent(props: {style?: CSSProperties}): ReactElement {

    const style = {
        height: 'calc(100vh - 4rem)',
        background: 'var(--surface-f)'
    };

    const error: any = useRouteError();

    const errorTab = new MenuTreeTab('Error', undefined, undefined, []);
    if (error.message) {
        const errorFieldTab = new MenuTreeTab('Error message', undefined, <p>{error.message.toString()}</p>);
        errorTab.children?.push(errorFieldTab);
    }
    if (error.stack) {
        const errorFieldTab = new MenuTreeTab('Error stack', undefined, <p>{error.stack.toString()}</p>);
        errorTab.children?.push(errorFieldTab);
    }
    if (errorTab.children?.length === 0) {
        errorTab.content = <p>{String(error)}</p>;
    }

    const errorTabs: MenuTreeTab[] = [errorTab];

    return(
        <div className="not-found-page flex flex-column align-items-center justify-content-center gap-3"
             style={Object.assign(style, props.style)}>
            <div>
                <span className="text-4xl mr-3">Whoops...</span>
            </div>
            <p className="text-4xl text-primary">Something went wrong</p>
            <div className="ml-4 mr-4">
                <PanelTree tabs={errorTabs}/>
            </div>
        </div>
    );
}
export const ErrorPage = React.memo(ErrorPageComponent);
