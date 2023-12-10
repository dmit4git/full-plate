import "./PanelTree.scss";
import React, {ReactElement, ReactNode} from "react";
import {PanelHeaderTemplateOptions} from "primereact/panel";
import {PanelBranch} from "./panel-branch/PanelBranch";

interface PromiseResolve {
    promise: Promise<boolean>,
    resolve: ((value: boolean | PromiseLike<boolean>) => void) | null
}
export class MenuTreeTab {

    key?: string;
    header?: string;
    icon?: string | ReactElement;
    expanded?: boolean;
    content?: ReactNode | ReactNode[];
    children?: MenuTreeTab[];
    panelHeader?: PanelHeaderTemplateOptions;
    expand = () => this.setCollapsedOfTab(false);
    collapse = () => this.setCollapsedOfTab(true);
    render: PromiseResolve;
    fakeEvent = {preventDefault: () => {}};

    constructor(
        header?: string, icon?: string | ReactElement, content?: ReactNode | ReactNode[], children?: MenuTreeTab[]
    ) {
        if (header) { this.header = header; }
        if (icon) { this.icon = icon; }
        if (children) { this.children = children; }
        if (content) { this.content = content; }
        this.render = this.makeRenderPromise();
    }

    makeRenderPromise(): PromiseResolve {
        let renderResolve: PromiseResolve['resolve'] = null;
        const renderPromise = new Promise<boolean>((resolve) => {renderResolve = resolve;});
        return {promise: renderPromise, resolve: renderResolve};
    }

    setCollapsedOfTab(collapsed: boolean) {
        if (this.panelHeader && this.panelHeader.collapsed !== collapsed) {
            this.panelHeader.onTogglerClick(this.fakeEvent as React.MouseEvent<HTMLElement>);
        }
    }
}

interface PanelTreeProps {
    tabs?: MenuTreeTab[],
    showTabIcons?: boolean
}

function PanelTreeComponent(props: PanelTreeProps): ReactElement {
    function recursivePanelTree(tabs: MenuTreeTab[], keyPrefix: string = '|') {
        const panelTabs: ReactElement[] = [];

        for (let index = 0; index < tabs.length; index++) {
            const tab = tabs[index];
            const key = keyPrefix + '-' + (tab.key || tab.header);
            panelTabs.push(
                <PanelBranch key={key} tab={tab}>
                    {tab.children && recursivePanelTree(tab.children, key)}
                </PanelBranch>
            );
        }

        return <div className="panel-tree-tab-children">{panelTabs}</div>;
    }

    return <div className="panel-tree">
        {recursivePanelTree(props.tabs || [])}
    </div>;
}
export const PanelTree = React.memo(PanelTreeComponent);
