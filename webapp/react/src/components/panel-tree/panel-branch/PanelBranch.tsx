import {Panel, PanelHeaderTemplateOptions} from "primereact/panel";
import {Ripple} from "primereact/ripple";
import React, {PropsWithChildren, ReactElement, RefObject, useEffect, useMemo, useRef} from "react";
import {MenuTreeTab} from "../PanelTree";
import {UserAccount} from "../../../layout/user-menu/native-auth/sign-up-form/new-account-form/NewAccountFormSlice";

interface PanelBranchProps extends PropsWithChildren {
    tab?: MenuTreeTab,
    showTabIcon?: boolean,
    key?: string
}

export interface IPanelBranchContent {
    tab?: MenuTreeTab,
    onSuccess?: (data: UserAccount) => void
}

function PanelBranchComponent(props: PanelBranchProps): ReactElement {

    const tab: MenuTreeTab = useMemo<MenuTreeTab>(() => props.tab || new MenuTreeTab(), [props.tab]);

    const panelRef: RefObject<Panel> = useRef<Panel>(null);

    useEffect(() => {
        props.tab?.resolvePanelRef(panelRef); // set panel reference on MenuTreeTab so it can call expand/collapse
        if (props.tab?.expandOnMount) {
            panelRef.current?.expand(undefined);
        }
    }, [props.tab]);

    function panelHeaderMaker(tab: MenuTreeTab) {

        const icon = props.showTabIcon
            ? typeof(tab.icon) === 'string' ? <i className={`pi pi-${tab.icon}`}></i> : tab.icon
            : null;

        return function panelHeader(options: PanelHeaderTemplateOptions) {
            tab.panelHeader = options;
            const collapsed = options?.collapsed || false;
            const iconClass = "pi pi-chevron-right " + (!collapsed ? 'panel-tree-tab-expanded' : '');
            return <div className={options.className + ' justify-content-between p-ripple'} onClick={options.onTogglerClick}>
                <div className="flex align-items-center">
                    <span className={options.togglerClassName + ' mr-2'}>
                        <i className={iconClass}></i>
                    </span>
                    <span className="vertical-align-middle">{tab.header}</span>
                </div>
                {icon}
                <Ripple />
            </div>;
        }
    }

    function makeContent() {
        if (!tab.content) {
            return null;
        }
        return <div className="flex flex-column gap-2">
            {tab.content}
        </div>;
    }

    return (
        <Panel toggleable headerTemplate={panelHeaderMaker(tab)}
               ref={panelRef} collapsed={!tab.expanded}>
            <div className="flex flex-column gap-3">
                {makeContent()}
                {props.children}
            </div>
        </Panel>
    );
}
export const PanelBranch = React.memo(PanelBranchComponent);
