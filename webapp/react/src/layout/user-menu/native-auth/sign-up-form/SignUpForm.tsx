import "./SignUpForm.scss";
import React, {ReactElement, useState} from "react";
import {IPanelBranchContent} from "../../../../components/panel-tree/panel-branch/PanelBranch";
import {NewAccountForm} from "./new-account-form/NewAccountForm";
import {Steps, StepsSelectEvent} from "primereact/steps";
import {Divider} from "primereact/divider";
import {ShiftPane} from "../../../../components/shift-pane/ShiftPane";
import {EmailConfirmation, EmailVerificationForm} from "./email-verification-form/EmailVerificationForm";
import {UserAccount} from "./new-account-form/NewAccountFormSlice";
import {MenuItem} from "primereact/menuitem";
import {queryParams} from "../../../MainLayout";
// import {signUpFormTab} from "../../UserMenu";

function SignUpFormComponent(props: IPanelBranchContent): ReactElement {

    // checking query params
    const emailParam: string | null = queryParams.get('email');
    const emailConfirmation: EmailConfirmation | null = queryParams.get('overlay') !== 'email-verification' ? null
        : { username: queryParams.get('username'), token: queryParams.get('email-verification')};

    // email address to confirm
    const [emailToConfirm, setEmailToConfirm] = useState<string>(emailParam || '');
    const [activeStep, setActiveStep] = useState<number>(emailConfirmation ? 1 : 0);

    const items: MenuItem[] = [ // steps menu
        {label: 'Create Account'},
        {label: 'Verify Email', disabled: !emailToConfirm && !emailConfirmation}
    ];

    function setConfirmEmailStep(data: UserAccount) {
        setEmailToConfirm(data.email);
        setActiveStep(1);
    }

    function onStepSelect(event: StepsSelectEvent) {
        setActiveStep(event.index);
    }

    function onEmailVerificationComplete() {
        setActiveStep(0);
        setEmailToConfirm('');
        // signUpFormTab.collapse();
    }

    return <div className="sign-up-form">
        <Steps model={items} activeIndex={activeStep} onSelect={onStepSelect} readOnly={false} />
        <Divider className="mb-3" />
        <ShiftPane paneIndex={activeStep}>
            <NewAccountForm {...props} onSuccess={setConfirmEmailStep}/>
            <EmailVerificationForm email={emailToConfirm} confirmation={emailConfirmation}
                                   onSignInCallback={onEmailVerificationComplete} />
        </ShiftPane>
    </div>
}
export const SignUpForm = React.memo(SignUpFormComponent);

