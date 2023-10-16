import React, {PropsWithChildren, ReactElement} from "react";
import {range} from "lodash-es";
import {Skeleton} from "primereact/skeleton";
import {DataTable, DataTablePassThroughOptions} from "primereact/datatable";
import {Column, ColumnBodyOptions, ColumnProps} from "primereact/column";
import {VirtualScrollerLazyEvent, VirtualScrollerProps} from "primereact/virtualscroller";
import {UserRow} from "../../layout/main-section/user-permissions/UserPermissionsDataHelper";

interface AppTableProps extends PropsWithChildren {
    columns: ColumnProps[],
    rows?: any[] | null,
    skeletons?: number | null, // Number of skeleton rows. Table displays skeleton rows instead of content if value is truthy.
    selection?: any[],
    stripedRows?: boolean,
    onRowSelection?: (selectedRows: any[]) => void,
    sizeInRows?: number,
    onLazyLoad?: (event: VirtualScrollerLazyEvent) => void
}

export interface RowSelectionEvent {
    originalEvent: any,
    value: any[],
    type: string
}

function AppTableComponent(props: AppTableProps): ReactElement {

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

    function rowCellTemplate(columnName: string) {
        return function(row: UserRow) {
            if (row.isDummy) {
                return <Skeleton className="w-full"></Skeleton>;
            }
            return String(row[columnName as keyof UserRow]);
        }
    }

    // make rows and row body template
    let rows: any[] | undefined, bodyTemplate: ColumnProps['body'];
    if (props.skeletons) {
        bodyTemplate = skeletonBody;
        rows = makeSkeletonRows(props.skeletons);
    } else {
        bodyTemplate = undefined;
        rows = props.rows || [];
    }
    // make columns
    const columnWidth = (100 / props.columns.length).toString() + '%';
    const columnPassThrough = {headerCell: {style: {width: columnWidth}}};
    const columns: ReactElement[] = props.columns.map(column =>
        <Column key={column.field} {...column} pt={columnPassThrough}
                body={bodyTemplate || rowCellTemplate(String(column.field))}>
        </Column>
    );

    const virtualScrollerOptions: VirtualScrollerProps = {
        lazy: true, onLazyLoad: props.onLazyLoad, itemSize: 55, delay: 200
    };
    // showLoader: true, loading: Boolean(props.skeletons), loadingTemplate: skeletonBody

    const tablePassThrough: DataTablePassThroughOptions = {thead: {style: {height: '55px'}}};
    const scrollHeight = 55 + (props.sizeInRows || 10) * (Number(virtualScrollerOptions.itemSize));
    console.log(props.sizeInRows, scrollHeight);
    return <DataTable value={rows} stripedRows={props.stripedRows} resizableColumns dataKey="id" pt={tablePassThrough}
                      selectionMode="multiple" dragSelection metaKeySelection={true}
                      selection={props.selection || []} onSelectionChange={onRowSelection as any}
                      scrollable scrollHeight={scrollHeight + 'px'} virtualScrollerOptions={virtualScrollerOptions} >
        {columns}
    </DataTable>;
}
export const AppTable = React.memo(AppTableComponent);
