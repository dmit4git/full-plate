import './SlideBar.scss'; // styles
import React, {ReactElement, useState} from 'react'; // react
// primereact
import {Sidebar} from 'primereact/sidebar';
// misc
import {mainLayoutControls, VisibilityHandlers} from '../../layout/MainLayoutControls';
import {Position} from '../../helpers/enums'


interface SlideBarProps {
    position?: Position,
    children?: React.ReactNode,
    onShow?: () => void
}

function SlideBarComponent(props: SlideBarProps): ReactElement {

    const position = props.position || Position.left;

    const [visible, setVisible] = useState<boolean>(false);
    const controls: VisibilityHandlers = mainLayoutControls[position + 'SlideBar'];

    controls.show = () => {
        if (props.onShow) {
            props.onShow();
        }
        setVisible(true);
    }
    
    const cssClass = position === Position.left ? 'slide-bar' : 'slide-bar-flipped';
    
    return(
        <Sidebar visible={visible} position={position} className={cssClass}
                 onHide={() => setVisible(false)} showCloseIcon={false}>
            {props.children}
        </Sidebar>
    )

}
export const SlideBar = React.memo(SlideBarComponent);
