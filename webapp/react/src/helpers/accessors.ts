import React from "react";
import {FetchBaseQueryError} from "@reduxjs/toolkit/query";
import {ApiResponse} from "../store/webApi";
import {isObject} from "./checks";

export function getComponentDisplayName(element: React.ReactElement) {
    const node = element as React.ReactElement<React.ComponentType<any>>;
    const type = (node as unknown as React.ReactElement<React.FunctionComponent>).type;
    return type && (
        (type as React.FunctionComponent).displayName
        || (type as React.FunctionComponent).name
    );
}

export interface ResponseError {
    code: string,
    description: string
}

interface ErrorData {
    status?: number,
    errors?: ResponseError[]
}

function getErrorData(response: ApiResponse) {
    return response.error && 'data' in response.error && response.error.data as ErrorData;
}

export function getErrorCodes(response: ApiResponse): (string | number)[] {
    const errorCodes: string[] = [];
    const errorData = getErrorData(response);
    if (isObject(errorData)) {
    }
    if (errorData && errorData.errors) {
        const errors: Array<ResponseError> = errorData.errors as Array<ResponseError>;
        for (let error of errors) {
            if (error.code !== undefined) { errorCodes.push(error.code); }
        }
    }
    if (errorCodes.length === 0) {
        const status = gerErrorStatus(response);
        if (status !== null) { return [status]; }
    }
    return errorCodes;
}

export function getErrorCode(response: ApiResponse): string | number | null {
    const errorCodes = getErrorCodes(response);
    return errorCodes.length > 0 ? errorCodes[0] : null;
}

function gerErrorStatus(response: ApiResponse): string | number | null {
    const error = response.error as FetchBaseQueryError;
    if (error) {
        if ('originalStatus' in error) {
            return error.originalStatus;
        }
        if ('status' in error) {
            return error.status;
        }
    }
    return null;
}

export function isConnectionError(errorCode: string | number | null) {
    return errorCode === 502;
}

export function getCurrentPath() {
    return window.location.origin + window.location.pathname;
}

export function getCurrentQuery() {
    return window.location.pathname + window.location.search;
}
