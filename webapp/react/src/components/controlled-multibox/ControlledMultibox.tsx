import React, {ReactElement} from "react";
import {Controller, UseControllerProps} from "react-hook-form";
import {ControllerRenderProps} from "react-hook-form/dist/types/controller";
import {classNames} from "primereact/utils";
import {
    MultiStateCheckbox,
    MultiStateCheckboxChangeEvent,
    MultiStateCheckboxProps
} from "primereact/multistatecheckbox";

export interface AppCheckboxProps extends UseControllerProps<any>, Omit<MultiStateCheckboxProps, 'defaultValue' | 'name' | 'checked'> {
    label: string,
    indeterminateChoice?: boolean
}

function ControlledMultiboxComponent(props: AppCheckboxProps): ReactElement {

    const options = [
        { value: 'checked', icon: "pi pi-check" },
        { value: 'indeterminate', icon: "pi pi-minus" }
    ];

    function valueToStatus(value: boolean | null) {
        switch (value) {
            case true:
                return 'checked';
            case null:
                return 'indeterminate';
        }
        return null;
    }

    function statusToValue(status: string | null) {
        switch (status) {
            case 'checked':
                return true;
            case 'indeterminate':
                return null;
        }
        return false;
    }

    function renderCheckbox({field}: {field: ControllerRenderProps}) {
        const {label, indeterminateChoice, ...checkboxProps} = props;
        const {value, ...fieldAttributes} = field;
        return <MultiStateCheckbox {...checkboxProps} {...fieldAttributes} id={field.name} ref={field.ref}
                                   value={valueToStatus(field.value)} options={options} optionValue="value"
                                   onChange={e => onChange(e, field)} />;
    }

    function onChange(event: MultiStateCheckboxChangeEvent, field: ControllerRenderProps) {
        let status = event.value;
        if (event.value === 'indeterminate' && !props.indeterminateChoice) {
            status = null; // skip 'indeterminate'
        }
        const value = statusToValue(status);
        const target = {...event.target, value: value};
        const eventCopy = {...event, value: value, target: target};
        field.onChange(eventCopy);
    }


    const cssClasses = classNames({'opacity-50': props.disabled});

    return <div>
        <Controller
            name={props.name || "ControlledMultibox"}
            control={props.control}
            render={renderCheckbox}
        />
        <label htmlFor={props.label} className={cssClasses}>{props.label}</label>
    </div>;
}
export const ControlledMultibox = React.memo(ControlledMultiboxComponent);
