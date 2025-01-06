import './FormButton.scss';
import React, {ReactElement} from "react";
import {Button, ButtonProps} from "primereact/button";
import {ErrorDiv} from "../../error-div/ErrorDiv";

interface FormButtonProps extends ButtonProps {
    label?: string,
    onClick?: React.MouseEventHandler<HTMLButtonElement>
    loading?: boolean,
    disabled?: boolean,
    error?: string | null
}

function FormButtonComponent(props: FormButtonProps): ReactElement  {

    const buttonLabel = !props.loading ? props.label : '';
    const severity = props.error || props.error === '' ? 'danger' : undefined;

    return <div className="form-button mt-3">
        <Button {...props} className="w-full" label={buttonLabel} severity={severity} />
        <ErrorDiv error={props.error} />
    </div>
}
export const FormButton = React.memo(FormButtonComponent);
