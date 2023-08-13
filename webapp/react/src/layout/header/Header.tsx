// styles
import './Header.scss'
// react
import React, {ReactElement, useState} from 'react';
// primereact
import { Button } from 'primereact/button';
// misc
import { mainLayoutControls } from "../MainLayoutControls";
import { useSelector } from "react-redux";
import { RootState } from '../../store/store';

function HeaderComponent(): ReactElement {

    const [leftSliderVisible, setLeftSliderVisible] 
        = useState<boolean>(false); // hides menu button

    const userSlice = useSelector((store: RootState) => store.user);

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

    const usernameAnimation = "animation-ease-in-out animation-duration-500 " +
        (userSlice.signedIn ? "fadeinright" : "fadeoutright animation-fill-forwards");
    const usernameWidth = userSlice.signedIn ? 'max-w-13rem' : 'max-w-0';
    return (
        <div className="header flex justify-content-between align-items-center">
            {/* left group */}
            <div className={sliderClasses}>
                <Button icon="pi pi-bars" className="p-button-rounded p-button-text no-focus" aria-label="Menu"
                        onClick={menuClickHandler}/>
                {/* Logo */}
                <div className="logo-text">
                    <div>FullPlate Prime</div>
                </div>
            </div>
            {/* right group */}
            <div className="flex align-items-center header-group m-2">
                <div className={"overflow-hidden max-w-t " + usernameWidth}>
                    <div className={"white-space-nowrap text-overflow-ellipsis overflow-hidden " + usernameAnimation}>
                        {userSlice.username}
                    </div>
                </div>
                <Button className="p-button-rounded p-button-text no-focus"
                        icon="pi pi-user" aria-label="User" onClick={accountClickHandler}/>
            </div>
        </div>
    )
}
export const Header = React.memo(HeaderComponent);
