import {error401, error403, serverCommunicationError, unknownErrorMessage} from "./constants";
import {RefObject} from "react";
import {Messages} from "primereact/messages";
import {isConnectionError} from "./accessors";

export function setError(messagesRef: RefObject<Messages>, error?: number | string) {
    let errorMessage = error || unknownErrorMessage;
    if (error === 401) { errorMessage = error401; }
    if (error === 403) { errorMessage = error403; }
    else if (error !== undefined && isConnectionError(error)) { errorMessage = serverCommunicationError; }
    messagesRef.current?.show([
        { severity: 'error', summary: 'Error:', detail: errorMessage, sticky: true, closable: true }
    ]);
}
