import './ErrorDiv.scss';
import React, {ReactElement} from "react";
import {useMemoState} from "../../helpers/hooks";

function ErrorDivComponent(props: {error?: string | null}): ReactElement  {

    const [error, setError] = useMemoState<string>('');

    let classNames = "error-div relative p-error text-center animation-ease-in-out animation-duration-500 "

    if (props.error) {
        setError(props.error);
        classNames += "fadeinup has-error";
    } else {
        classNames += "fadeoutup animation-fill-forwards no-error";
    }

    return <div className={classNames}>{error}</div>
}
export const ErrorDiv = React.memo(ErrorDivComponent);
