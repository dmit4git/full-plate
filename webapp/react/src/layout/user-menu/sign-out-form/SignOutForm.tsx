import React, {FC, ReactElement} from "react";
import { Button } from "primereact/button";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "../../../store/store";
import { useLazySignOutQuery } from "./SignOutFormApi";
import { userSignOut } from "../../UserSlice";
import {InputText} from "primereact/inputtext";

function SignOutFormComponent(): ReactElement {

    const userSlice = useSelector((store: RootState) => store.user);
    const [signOutTrigger, signOutResult, signOutLastPromiseInfo] = useLazySignOutQuery();
    const dispatch = useDispatch();
    
    async function onSignUpClick() {
        const signUpResult = await signOutTrigger();
        dispatch(userSignOut());
    }
    
    return <div>
        <div className={"flex"}> <small>&nbsp;</small> </div> {/* adds error spacing like in InputField */}
        <div className="sign-out-form flex gap-4">
            <div className="p-float-label flex-grow-1 w-full">
                <InputText className="text-overflow-ellipsis" id="sign-out-username" name="username"
                           value={userSlice.username || ''} disabled={true}/>
                <label htmlFor="sign-out-username">username</label>
            </div>
            <Button className="w-full flex-grow-1" label="Sign Out"
                    onClick={onSignUpClick} loading={signOutResult.isLoading} />
        </div>
    </div>
}

export const SignOutForm = React.memo(SignOutFormComponent);
