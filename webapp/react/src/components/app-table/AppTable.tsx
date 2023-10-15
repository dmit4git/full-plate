import React, {PropsWithChildren, ReactElement, useState} from "react";
import {range} from "lodash-es";
import {Skeleton} from "primereact/skeleton";
import {DataTable} from "primereact/datatable";
import {Column, ColumnBodyOptions, ColumnProps} from "primereact/column";

interface AppTreeProps extends PropsWithChildren {
    columns: ColumnProps[],
    rows?: any[],
    skeletons?: number, // Number of skeleton rows. Table displays skeleton rows instead of content if value is truthy.
    selection?: any[],
    stripedRows?: boolean,
    onRowSelection?: (selectedRows: any[]) => void
}

export interface RowSelectionEvent {
    originalEvent: any,
    value: any[],
    type: string
}

function AppTableComponent(props: AppTreeProps): ReactElement {

    function makeSkeletonRows(skeletons?: number): any[] {
        // make skeleton row template
        const skeleton: any = {};
        for (let column of props.columns) {
            if (column.field) {
                skeleton[column.field] = '';
            }
        }
        // return skeleton rows
        return range(skeletons || 0).map(i => {
            return {id: i.toString(), ...skeleton};
        });
    }

    function skeletonBody(data: any, options: ColumnBodyOptions) {
        return <Skeleton className="w-full"></Skeleton>;
    }

    function onRowSelection(event: RowSelectionEvent) {
        if (props.onRowSelection) {
            props.onRowSelection(event.value);
        }
    }

    // make rows and row body template
    let rows: any[] | undefined, bodyTemplate: ColumnProps['body'];
    if (props.skeletons) {
        bodyTemplate = skeletonBody;
        rows = makeSkeletonRows(props.skeletons);
    } else {
        bodyTemplate = undefined;
        rows = props.rows;
    }
    // make columns
    const columnWidth = (100 / props.columns.length).toString() + '%';
    const passThrough = {headerCell: {style: {width: columnWidth}}};
    const columns: ReactElement[] = props.columns.map(column =>
        <Column key={column.field} body={bodyTemplate} {...column} pt={passThrough}></Column>
    );

    return <DataTable value={rows} stripedRows={props.stripedRows} resizableColumns dataKey="id"
                      selectionMode="multiple" dragSelection metaKeySelection={true}
                      selection={props.selection || []} onSelectionChange={onRowSelection as any} >
        {columns}
    </DataTable>;
}
export const AppTable = React.memo(AppTableComponent);
