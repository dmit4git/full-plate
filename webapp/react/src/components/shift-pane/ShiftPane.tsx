import "./ShiftPane.scss";
import React, {PropsWithChildren, ReactElement} from "react";
import {isArray} from "../../helpers/checks";

interface SwipePaneProps extends PropsWithChildren {
    paneIndex?: number;
}

function ShiftPaneComponent(props: SwipePaneProps): ReactElement  {

    const paneFragments = [];
    let childrenNumber = 1;
    const paneIndex = props.paneIndex || 0;

    if (props.children) {
        const childrenArray: Array<typeof props.children> =
            isArray(props.children) ? props.children as Array<typeof props.children>: [props.children];
        childrenNumber = childrenArray.length;
        for (let index = 0; index < childrenArray.length; index++) {
            const maxHeight = index === paneIndex ? 'max-h-screen' : 'max-h-0';
            paneFragments.push(
                <div key={`shift-pane-${paneFragments.length}`}
                     className={"shift-pane-fragment w-full flex-shrink-0 " + maxHeight}>
                    {childrenArray[index]}
                </div>
            );
        }
    }

    const framesToShift = Math.min(paneIndex, childrenNumber - 1);
    const leftStyle = {left: `calc(${(-100 * framesToShift)}% - ${framesToShift}rem`};
    return <div className="w-full overflow-hidden">
        <div className="shift-pane relative flex gap-3 w-full" style={leftStyle}>
            {paneFragments}
        </div>
    </div>
}
export const ShiftPane = React.memo(ShiftPaneComponent);
