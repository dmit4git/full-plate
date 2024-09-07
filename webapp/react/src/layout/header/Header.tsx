// styles
import './Header.scss'
// react
import React, {ReactElement, useState} from 'react';
// primereact
import { Button } from 'primereact/button';
// misc
import { mainLayoutControls } from "../MainLayoutControls";
import {useSelector} from "react-redux";
import {RootState} from "../../store/store";

function HeaderComponent(): ReactElement {

    const userSlice = useSelector((store: RootState) => store.user);

    const [, setLeftSliderVisible] = useState<boolean>(false); // hides menu button

    mainLayoutControls.leftSlideBar.hide = () => setLeftSliderVisible(false);
    mainLayoutControls.leftSlideBar.hide = () => setLeftSliderVisible(false);

    function menuClickHandler() {
        setLeftSliderVisible(true);
        mainLayoutControls.leftSlideBar.show();
    }

    function accountClickHandler() {
        mainLayoutControls.rightSlideBar.show();
    }

    let sliderClasses = "sliding flex align-items-center header-group m-2";

    const signedIn = userSlice.signedIn;
    const usernameAnimation = "animation-ease-in-out animation-duration-500 " +
        (signedIn ? "fadeinright" : "fadeoutright animation-fill-forwards");
    const usernameWidth = signedIn ? 'max-w-13rem' : 'max-w-0';
    return (
        <div className="header-wrapper">
            <div className="header flex justify-content-between align-items-center">
                {/* left group */}
                <div className={sliderClasses}>
                    <Button icon="pi pi-bars" className="p-button-rounded p-button-text no-focus" aria-label="Menu"
                            onClick={menuClickHandler}/>
                </div>
                {/* right group */}
                <div className="flex align-items-center header-group m-2">
                    <div className={"overflow-hidden max-w-t " + usernameWidth}>
                        <div className={"white-space-nowrap text-overflow-ellipsis overflow-hidden " + usernameAnimation}>
                            {(signedIn && userSlice.username) || null}
                        </div>
                    </div>
                    <Button className="p-button-rounded p-button-text no-focus"
                            icon="pi pi-user" aria-label="User" onClick={accountClickHandler}/>
                </div>
            </div>
        </div>
    )
}
export const Header = React.memo(HeaderComponent);
