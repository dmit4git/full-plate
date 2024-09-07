import "./PanelTree.scss";
import React, {ReactElement, ReactNode, RefObject} from "react";
import {Panel, PanelHeaderTemplateOptions} from "primereact/panel";
import {PanelBranch} from "./panel-branch/PanelBranch";

export class MenuTreeTab {

    key?: string;
    header?: string;
    icon?: string | ReactElement;
    expanded?: boolean;
    expandOnMount?: boolean;
    content?: ReactNode | ReactNode[];
    parent?: MenuTreeTab;
    children?: MenuTreeTab[];
    panelHeader?: PanelHeaderTemplateOptions;
    panelRef?: RefObject<Panel>;
    resolvePanelRef: (ref: RefObject<Panel>) => void;
    panelRefPromise: Promise<RefObject<Panel>>;
    expand: () => void;
    collapse: () => void;
    fakeEvent = {preventDefault: () => {}};

    constructor(
        header?: string, icon?: string | ReactElement, content?: ReactNode | ReactNode[], children?: MenuTreeTab[],
        expandOnMount?: boolean
    ) {
        if (header) { this.header = header; }
        if (icon) { this.icon = icon; }
        if (children) {
            this.children = children;
            for (const child of this.children) {
                child.parent = this;
            }
        }
        if (content) { this.content = content; }
        this.expandOnMount = expandOnMount;
        this.resolvePanelRef = (ref: RefObject<Panel>) => {};
        this.panelRefPromise = new Promise((resolve, reject) => this.resolvePanelRef = resolve);
        this.expand = () => this.panelRefPromise.then(
            (panelRef: RefObject<Panel>) => panelRef.current?.expand(undefined)
        );
        this.collapse = () => this.panelRefPromise.then(
            (panelRef: RefObject<Panel>) => panelRef.current?.collapse(undefined)
        );
    }

    findChildByHeader(header: string) {
        const children: MenuTreeTab[] = this.children || [];
        return children.find(child => child.header === header);
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

        return panelTabs.length ? <div className="panel-tree-tab-children">{panelTabs}</div> : null;
    }

    return <div className="panel-tree">
        {recursivePanelTree(props.tabs || [])}
    </div>;
}
export const PanelTree = React.memo(PanelTreeComponent);
