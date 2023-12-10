import React, {ReactElement, useState} from "react";
import {MenuTreeTab, PanelTree} from "../../components/panel-tree/PanelTree";
import {SlideBar} from "../../components/slide-bar/SlideBar";
import {isEmpty} from "lodash-es";
import {Link} from "react-router-dom";
import {useMemoState} from "../../helpers/hooks";

const navigationTab = new MenuTreeTab('Navigation', undefined, makeNavigationLink('/home', 'Home'));
let accessTabs: MenuTreeTab[] = [];

function makeNavigationLink(uri: string, text: string) {
    return <div className="flex align-items-center gap-3" key={text}>
        <i className="pi pi-arrow-right text-xs"></i>
        <Link to={uri}>{text}</Link>
    </div>;
}

function MainMenuComponent(): ReactElement {

    const [accessTree, setAccessTree] = useMemoState<any>({});

    function updateAccessTree() {
        const storedAccessTree: any = JSON.parse(localStorage.getItem('accessTree') || '{}');
        setAccessTree(storedAccessTree);
    }

    function addTabsFromAccessTree() {
        // remove inaccessible tabs
        accessTabs = accessTabs.filter(tab => tab.header as string in accessTree);
        // add accessible tabs
        for (let [key, value] of Object.entries(accessTree)) {
            let tab = accessTabs.find(t => t.header === key);
            if (!tab) {
                tab = new MenuTreeTab(key);
                accessTabs.push(tab);
            }
            fillWithAccessBranch(tab, value, '');
        }
    }

    function fillWithAccessBranch(tab: MenuTreeTab, accessBranch: any, uriBase: string) {
        const children: MenuTreeTab[] = (tab.children || [])
            .filter(child => child.header as string in accessBranch);
        const contentItems: ReactElement[] = (tab.content as ReactElement[] || [])
            .filter(child => child.key as string in accessBranch);
        const parentKey = tab.header || '';
        uriBase += '/' + parentKey.toLowerCase().replace(' ', '-');
        for (let [key, value] of Object.entries(accessBranch)) {
            if (value && !isEmpty(value)) {
                let childTab = children.find(t => t.header === key);
                if (!childTab) {
                    childTab = new MenuTreeTab(key);
                    children.push(childTab);
                }
                fillWithAccessBranch(childTab, value, uriBase);
            } else {
                if (!contentItems.find(item => item.key === key)) {
                    const uri = uriBase + '/' + key.toLowerCase().replace(' ', '-');
                    const link = makeNavigationLink(uri, key);
                    contentItems.push(link);
                }
            }
        }
        if (children.length > 0) {
            tab.children = children;
        }
        if (contentItems.length > 0) {
            tab.content = contentItems;
        }
    }

    addTabsFromAccessTree();
    return <SlideBar onShow={updateAccessTree}>
        <PanelTree tabs={[navigationTab, ...accessTabs]} />
    </SlideBar>;

}
export const MainMenu = React.memo(MainMenuComponent);
