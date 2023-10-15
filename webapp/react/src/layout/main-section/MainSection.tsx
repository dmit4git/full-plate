import "./MainSection.scss"
import React, {ReactElement, useEffect} from "react";
import {Outlet} from "react-router-dom";
import {mainLayoutControls} from "../MainLayoutControls";
import {accountMenuTab, signUpFormTab} from "../user-menu/UserMenu";
import {queryParams} from "../MainLayout";

export const rootPlaceholder = (
    <div className="image-placeholder flex justify-content-center h-full">
        <img src="/PancakesFullPlate.svg" alt=""/>
    </div>
);

function emailConfirmationQuery() {
    mainLayoutControls.rightSlideBar.show(); // open user menu
    accountMenuTab.render?.promise?.then(() => {
        accountMenuTab.expand(); // open account tab
        signUpFormTab.render?.promise?.then(() => {
            signUpFormTab.expand(); // open create account tab
        });
    });
}

function MainSectionComponent(): ReactElement {

    function checkOverlayParams() {
        if (queryParams.get('overlay') === 'email-verification') {
            emailConfirmationQuery();
        }
    }
    useEffect(checkOverlayParams, []);

    return(
        <div className="main-section-wrapper">
            <div className="main-section mx-auto">
                <Outlet />
            </div>
        </div>
    );
}
export const MainSection = React.memo(MainSectionComponent);
