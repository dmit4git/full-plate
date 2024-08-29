import "./MainSection.scss"
import React, {ReactElement} from "react";
import {Outlet} from "react-router-dom";

export const rootPlaceholder = (
    <div className="image-placeholder flex justify-content-center h-full">
        <img src="/PancakesFullPlate.svg" alt=""/>
    </div>
);

function MainSectionComponent(): ReactElement {

    return(
        <div className="main-section-wrapper">
            <div className="main-section mx-auto">
                <Outlet />
            </div>
        </div>
    );
}
export const MainSection = React.memo(MainSectionComponent);
