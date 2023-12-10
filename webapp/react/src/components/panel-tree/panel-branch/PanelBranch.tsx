import {Panel, PanelHeaderTemplateOptions} from "primereact/panel";
import {Ripple} from "primereact/ripple";
import React, {PropsWithChildren, ReactElement, useEffect, useMemo} from "react";
import {MenuTreeTab} from "../PanelTree";
import {UserAccount} from "../../../layout/user-menu/sign-up-form/new-account-form/NewAccountFormSlice";

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
    function resolveRenderPromise() {
        if (tab?.render?.resolve) { tab.render.resolve(true); }
    }
    useEffect(resolveRenderPromise, [tab]);

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

    return (
        <Panel toggleable headerTemplate={panelHeaderMaker(tab)}
               collapsed={!tab.expanded}
               onExpand={() => tab.expanded = true}
               onCollapse={() => tab.expanded = false} >
            <div className="flex flex-column gap-3">
                <div className="flex flex-column gap-2">
                    {tab.content}
                </div>
                {props.children}
            </div>
        </Panel>
    );
}
export const PanelBranch = React.memo(PanelBranchComponent);
