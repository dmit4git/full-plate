import "./InputField.scss"
import {InputText} from "primereact/inputtext";
import React, {ReactElement} from "react";
import {useDispatch} from "react-redux";
import {useMemoState} from "../../../helpers/hooks";
import {useController, UseControllerProps, Validate} from "react-hook-form";
import {Password} from "primereact/password";
import {ControllerRenderProps} from "react-hook-form/dist/types/controller";
import {Divider} from "primereact/divider";
import {CharType, charTypesInString, emailRegExp} from "../../../helpers/checks";
import {ProgressBar} from "primereact/progressbar";
import {KeyFilterType} from "primereact/keyfilter";

export enum FieldType {
    email,
    password
}

interface InputFieldProps extends UseControllerProps<any> {
    type?: FieldType,
    idPrefix?: string,
    value?: string,
    valueAction?: Function,
    valueCallback?: Function,
    required?: boolean,
    disabled?: boolean,
    passwordMeter?: boolean,
    error?: string,
    match?: string
}

interface InputAttributes extends ControllerRenderProps {
    value: string,
    id?: string,
    className?: string,
    toggleMask?: boolean,
    appendTo?: null | HTMLElement | 'self',
    disabled?: boolean,
    feedback?: boolean,
    keyfilter?: KeyFilterType,
    onFocus?: () => void,
    onShow?: () => void,
    onHide?: () => void
}

function InputFieldComponent(props: InputFieldProps): ReactElement {

    const errorsDescription: Record<string, string | (() => string)> = {
        'required': () => props.name + ' is required',
        'maxLength': 'too long',
        'minLength': 'too short',
        'max': 'too big',
        'min': 'too small',
        'weak password': 'too weak',
        'taken': 'already taken',
        'not match': () => 'does not match' + (props.match ? ' ' + props.match : '')
    }

    // rules
    const rules = props.rules || {};
    rules.required = Boolean(props.required);
    rules.maxLength = 254; // max email length, used as default max length for any input
    if (!rules.validate) { rules.validate = {}; }
    if (props.type === FieldType.email) {
        rules.pattern = emailRegExp;
    } else if (props.type === FieldType.password) {
        if ( props.passwordMeter) {
            addValidator('weak password', passwordIsStrong);
        }
        if (props.match && props.control) {
            addValidator('not match', valueMatches);
        }
    }
    function addValidator(error: string, validator: Validate<any, any>) {
        rules.validate = {...rules.validate, [error]: validator};
    }
    function passwordIsStrong(value: string) {
        const checks = makePasswordChecks(value);
        return checks.every(check => check.check);
    }
    function valueMatches(value: string) {
        const match = props.control!._fields[props.match!]?._f.value;
        return value === match;
    }
    
    // hooks
    const { field, fieldState } = useController({...props, rules});
    const [error, setError] = useMemoState<string>('\u00A0');
    const [showPasswordMeter, setShowPasswordMeter] = useMemoState<boolean>(false);
    const dispatch = useDispatch();
    
    // value change handler
    function onChange(event: React.ChangeEvent<HTMLInputElement>) {
        const value = event.target.value;
        if (props.valueAction) {
            dispatch(props.valueAction(value));
        }
        if (props.valueCallback) {
            props.valueCallback(value);
        }
        field.onChange(event);
    }

    // get provided error message or infer it from error type 
    // and remember the message so component could fade it out when field is valid 
    if (fieldState.error) {
        const errorMessage = fieldState.error.message || makeErrorMessage(fieldState.error);
        setError(errorMessage);
    }
    function makeErrorMessage(error: typeof fieldState.error): string {
        const description = error && errorsDescription[error.type];
        if (description && typeof description !== 'string') {
            return description();
        } else {
            return `this ${props.name} is ${description || 'invalid'}`;
        }

    }

    // render variables
    const errorAnimation = "animation-ease-in-out animation-duration-500 "
        + (fieldState.invalid ? "fadeindown" : "fadeoutdown animation-fill-forwards");
    const inputId = props.idPrefix ? `${props.idPrefix}-${props.name}` : props.name;
    const classNames = "w-full " + (fieldState.invalid ? 'p-invalid' : '');
    const attributes: InputAttributes = {
        id: inputId, ...field, onChange: onChange, className: classNames
    };
    if (props.disabled !== undefined) {
        attributes.disabled = props.disabled;
    }

    interface PasswordCheck {check: boolean, charType?: CharType, length?: number}
    function makePasswordChecks(value: string): PasswordCheck[] {
        const presentTypes = charTypesInString(value);
        const passwordChecks: PasswordCheck[] = [CharType.lower, CharType.upper, CharType.number, CharType.special]
            .map(charType => {return {charType: charType, check: presentTypes.has(charType)};});
        const lengthIsOk = Boolean(value) && value.length >= 8;
        passwordChecks.push({length: 8, check: lengthIsOk});
        return passwordChecks;
    }
    function makePasswordContent(passwordChecks: PasswordCheck[]) {
        const checked = passwordChecks.filter(check => check.check).length;
        const progressLabel = (value: undefined | null | string | number) => <>{`${checked}/${passwordChecks.length}`}</>;
        return <div className="flex w-full gap-2">
            <span>Password requirements:</span>
            <ProgressBar
                className="flex-grow-1 h-1rem" value={checked * 20} displayValueTemplate={progressLabel}
            ></ProgressBar>
        </div>
    }

    // makes password requirements list
    function makePasswordPanelFooter(passwordChecks: PasswordCheck[]) {
        const passwordCheckBulletpoints: Array<JSX.Element> = [];
        let passwordCheckNum = 0;
        for (let passwordCheck of passwordChecks) {
            if (passwordCheck.charType !== undefined) {
                const text = `must have ${passwordCheck.charType} character`;
                passwordCheckBulletpoints.push(makePasswordBulletPoint(passwordCheck.check, text, passwordCheckNum++));
            }
        }
        const lengthCheck = passwordChecks
            .find(check => check.length !== undefined);
        if (lengthCheck === undefined) {
            return null;
        }
        const text = `minimum ${lengthCheck.length} characters long`;
        passwordCheckBulletpoints.push(makePasswordBulletPoint(lengthCheck.check, text, passwordCheckNum++));
        return <>
            <Divider />
            <div className="flex flex-column gap-1">
                {passwordCheckBulletpoints}
            </div>
        </>;
    }

    // makes single password requirement bullet point
    function makePasswordBulletPoint(check: boolean, text: string, key: number | string) {
        return <span className="flex" key={key}>
                <i className={'pi ' + (check ? 'pi-check-circle' : 'pi-circle')}
                   style={check ? { color: 'var(--primary-color)' } : undefined}></i>
                &nbsp;
                <span>{text}</span>
            </span>;
    }

    // expands height of the component to make room for the password meter panel
    function setPasswordMeterExpanse(value: boolean) {
        if (value) {
            setShowPasswordMeter(true);
        } else {
            // 0.1s delay to wait for click to complete on 'Sign Up' button before the button slides up
            setTimeout(() => setShowPasswordMeter(false), 100);
        }
    }

    // make input element
    let input;
    if (props.type === FieldType.password) {
        const passwordChecks = makePasswordChecks(field.value);
        const panelContent = makePasswordContent(passwordChecks);
        const panelFooter = makePasswordPanelFooter(passwordChecks);
        // rules.validate = {'password is too weak': (value) => props.passwordMeter &&
        //         passwordChecks.every(check => check.check)};
        attributes.toggleMask = true;
        attributes.appendTo = 'self';
        attributes.feedback = props.passwordMeter;
        attributes.onShow = () => setPasswordMeterExpanse(true);
        attributes.onHide = () => setPasswordMeterExpanse(false);
        input = <Password {...attributes} content={panelContent} footer={panelFooter}/>;
    } else {
        if (props.type === FieldType.email) {
            attributes.keyfilter = 'email';
        }
        input = <InputText {...attributes}/>;
    }

    // render
    return (
        <div className={'input-field ' + (props.passwordMeter && showPasswordMeter ? 'password-input-meter' : '')}>
            <div className={"input-error relative z-1 flex justify-content-end " + errorAnimation}>
                <small className="p-error">{error}</small>
            </div>
            <div className="p-float-label">
                { input }
                <label htmlFor={inputId}>{props.name}</label>
            </div>
        </div>
    );
}
export const InputField = React.memo(InputFieldComponent);
