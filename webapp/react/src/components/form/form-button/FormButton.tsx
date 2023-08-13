import './FormButton.scss';
import React, {FC, ReactElement} from "react";
import {Button} from "primereact/button";
import {ErrorDiv} from "../../error-div/ErrorDiv";

interface FormButtonProps {
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
        <Button className="w-full" label={buttonLabel} onClick={props.onClick}
                loading={props.loading} disabled={props.disabled} severity={severity} />
        <ErrorDiv error={props.error} />
    </div>
}
export const FormButton = React.memo(FormButtonComponent);
