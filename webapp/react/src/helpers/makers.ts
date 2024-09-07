import {unknownErrorMessage} from "./constants";
import {MessagesMessage} from "primereact/messages";

export function makeErrorMessage(message?: string, summary?: string | null): MessagesMessage {
    return {
        severity: 'error',
        summary: summary,
        detail: message || unknownErrorMessage,
        sticky: true,
        closable: true
    };
}

export function makeWarningMessage(message?: string, summary?: string | null): MessagesMessage {
    return {
        severity: 'warn',
        summary: summary,
        detail: message || unknownErrorMessage,
        sticky: true,
        closable: true
    };
}
