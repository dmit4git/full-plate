import React, {ReactElement} from "react";
import {Button} from "primereact/button";
import {Message} from "primereact/message";
import {
    useLazyAuthenticatedEndpointQuery,
    useLazyRoleProtectedEndpointQuery,
    useLazyUnprotectedEndpointQuery
} from "./CheckAuthSsoApi";
import {UseLazyQuery} from "@reduxjs/toolkit/dist/query/react/buildHooks";
import {QueryDefinition} from "@reduxjs/toolkit/query";

interface AuthCheckerComponentProps {
    buttonLabel: string,
    lazyQuery: UseLazyQuery<QueryDefinition<void, any, any, {value: string}>>
}

function AuthCheckerComponent(props: AuthCheckerComponentProps): ReactElement {

    const [trigger, result] = props.lazyQuery();

    function makeMessage() {
        let message = <></>;
        if (result.isSuccess) {
            message = <Message severity='success' text="200" />;
        } else if (result.isError) {
            const status = result.error?.status || '???';
            message = <Message severity='error' text={status} />;
        }
        return <div className="w-15rem">{message}</div>;
    }

    return(
        <div className="flex flex-row gap-4 justify-content-center">
            <Button className="w-18rem" label={props.buttonLabel}
                    onClick={() => trigger()}
                    loading={result.isFetching}/>
            {makeMessage()}
        </div>
    );
}
export const AuthChecker = React.memo(AuthCheckerComponent);

function CheckAuthSsoComponent(): ReactElement {

    return(
        <div className="home h-full flex flex-column gap-4 justify-content-center align-items-center">
            <AuthChecker buttonLabel={"call unprotected endpoint"}
                         lazyQuery={useLazyUnprotectedEndpointQuery} />
            <AuthChecker buttonLabel={"call authenticated endpoint"}
                         lazyQuery={useLazyAuthenticatedEndpointQuery} />
            <AuthChecker buttonLabel={"call role-protected endpoint"}
                         lazyQuery={useLazyRoleProtectedEndpointQuery} />
        </div>
    );
}
export const CheckAuthSso = React.memo(CheckAuthSsoComponent);
