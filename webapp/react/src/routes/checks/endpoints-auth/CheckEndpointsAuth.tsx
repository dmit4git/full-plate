import "./CheckEndpointsAuth.scss";
import React, {ReactElement, RefObject, useRef} from "react";
import {Button} from "primereact/button";
import {
    useLazyAuthenticatedEndpointQuery,
    useLazyRoleProtectedEndpointQuery,
    useLazyUnprotectedEndpointQuery
} from "./CheckEndpointsAuthApi";
import {LazyQueryTrigger, UseLazyQuery, UseQueryStateResult} from "@reduxjs/toolkit/dist/query/react/buildHooks";
import {QueryDefinition, QueryResultSelectorResult} from "@reduxjs/toolkit/query";
import {DataTable} from "primereact/datatable";
import {Column} from "primereact/column";
import {isObject} from "../../../helpers/checks";
import {Messages} from "primereact/messages";

type EndpointQuery = QueryDefinition<void, any, any, {value: string}>;

class EndpointRow {
    description: string;
    queryTrigger: LazyQueryTrigger<EndpointQuery>;
    queryResult: UseQueryStateResult<EndpointQuery, any>;
    messagesRef: RefObject<Messages>;
    messages: ReactElement;
    constructor(endpointRow: EndpointRow) {
        this.description = endpointRow.description;
        this.queryTrigger = endpointRow.queryTrigger;
        this.queryResult = endpointRow.queryResult;
        this.messagesRef = endpointRow.messagesRef;
        this.messages = <Messages className="messages-row" ref={this.messagesRef} />
    }
}

function CheckEndpointsAuthComponent(): ReactElement {

    function getTriggerAndResult(query: UseLazyQuery<EndpointQuery>) {
        const [queryTrigger, queryResult] = query();
        return {queryTrigger, queryResult};
    }
    const endpointRows: EndpointRow[] = [
        new EndpointRow({description: "unsecured endpoint",
            ...getTriggerAndResult(useLazyUnprotectedEndpointQuery),
            messagesRef: useRef<Messages>(null)} as EndpointRow),
        new EndpointRow({description: "requires authentication",
            ...getTriggerAndResult(useLazyAuthenticatedEndpointQuery),
            messagesRef: useRef<Messages>(null)} as EndpointRow),
        new EndpointRow({description: 'requires "hello-world-role" role',
            ...getTriggerAndResult(useLazyRoleProtectedEndpointQuery),
            messagesRef: useRef<Messages>(null)} as EndpointRow)
    ];

    function callButton(row: EndpointRow) {
        return <Button className="w-6rem my-3" label="call"
                       onClick={() => row.queryTrigger().then(result => addQueryResultToStatuses(row, result))}
                       loading={row.queryResult.isFetching}/>;
    }

    function addQueryResultToStatuses(row: EndpointRow, result: QueryResultSelectorResult<EndpointQuery>) {
        let status: string | null = null;
        if (result.isSuccess) {
            status = '200';
        } else if (result.isError) {
            const error = result.error;
            if (isObject(error)) {
                status = error.originalStatus || error.status;
            }
        }
        addMessage(row, status || '???');
    }

    function addMessage(row: EndpointRow, summary: string) {
        const messages = row.messagesRef.current;
        if (messages) {
            const severity = summary === '200' ? 'success' : 'error';
            messages.show({severity, summary, sticky: false});
        }
    }

    return(
        <div className="home w-full h-full flex flex-column gap-4 justify-content-center align-items-center">
            <DataTable value={endpointRows} resizableColumns className="p-5 w-full">
                <Column field="description" header="Endpoint description"
                        style={{width: '30%'}}
                        bodyStyle={{ textAlign: 'center' }}></Column>
                <Column header="Call button" body={callButton}
                        style={{width: '20%'}}
                        bodyStyle={{ textAlign: 'center' }}></Column>
                <Column header="Call result" body={(row) => row.messages}></Column>
            </DataTable>
        </div>
    );
}
export const CheckEndpointsAuth = React.memo(CheckEndpointsAuthComponent);

