import React from "react";
import {FetchBaseQueryError, QueryStatus} from "@reduxjs/toolkit/query";
import {SerializedError} from "@reduxjs/toolkit";
import {ApiResponse} from "../store/webApi";
import {isObject} from "./checks";
import {unknownErrorMessage} from "./constants";

export function getComponentDisplayName(element: React.ReactElement<any>) {
    const node = element as React.ReactElement<React.ComponentType<any>>;
    const type = (node as unknown as React.ReactElement<React.FunctionComponent>)
        .type;
    const displayName = type && (
        (type as React.FunctionComponent).displayName ||
        (type as React.FunctionComponent).name
    )
    return displayName;
}

export interface ResponseError {
    code: string,
    description: string
}
function getErrorData(response: ApiResponse) {
    return response.error && 'data' in response.error && response.error.data as any;
}
export function getErrorCode(response: ApiResponse): string | number | null {
    const errorData = getErrorData(response);
    if (!isObject(errorData) || !('error' in errorData)) {
        return gerErrorStatus(response);
    }
    const error: ResponseError = errorData.error;
    return error.code !== undefined ? error.code : null;
}
export function getErrorCodes(response: ApiResponse): (string | number)[] {
    const errorCodes: string[] = [];
    const errorData = getErrorData(response);
    if (isObject(errorData)) {
        if ('errors' in errorData) {
            const errors: Array<ResponseError> = errorData.errors as Array<ResponseError>;
            for (let error of errors) {
                if (error.code !== undefined) { errorCodes.push(error.code); }
            }
        }
        if ('error' in errorData) {
            const error = errorData.error as ResponseError;
            if (error.code !== undefined) { errorCodes.push(error.code); }
        }
    }
    if (errorCodes.length === 0) {
        const status = gerErrorStatus(response);
        if (status !== null) { return [status]; }
    }
    return errorCodes;
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
